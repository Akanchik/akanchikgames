// Глобальные переменные
let games = [];
let filteredGames = [];
let currentScreenshotIndex = 0;
let activeFilters = {
  genres: [],
  difficulties: [],
  languages: []
};

// Загрузка данных
document.addEventListener('DOMContentLoaded', function() {
  console.log('Загрузка games.json...');
  
  fetch('games.json')
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then(data => {
      console.log('Данные загружены:', data);
      games = data;
      filteredGames = [...games];
      
      // Обновляем счетчики
      updateGamesCounter();
      
      // Определяем, на какой мы странице
      const listEl = document.getElementById('game-list');
      if (listEl) {
        renderGameList();
        initSearchAndFilters();
      } else {
        loadGamePage();
      }
    })
    .catch(error => {
      console.error('Ошибка загрузки игр:', error);
      showError();
    });
});

// Показать ошибку загрузки
function showError() {
  const listEl = document.getElementById('game-list');
  if (listEl) {
    listEl.innerHTML = `
      <div class="no-results">
        <h3>❌ Ошибка загрузки</h3>
        <p>Не удалось загрузить список игр.</p>
        <p style="font-size: 14px; color: #666;">Проверьте консоль браузера (F12)</p>
        <button onclick="location.reload()" style="
          background: #00A2FF;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 40px;
          margin-top: 20px;
          cursor: pointer;
          font-weight: 600;
        ">🔄 Обновить</button>
      </div>
    `;
  }
}

// 🔹 Обновление счетчика игр
function updateGamesCounter() {
  const counter = document.getElementById('games-count');
  const gamesStat = document.getElementById('games-stat');
  const emptyState = document.getElementById('empty-state');
  
  if (counter) {
    counter.textContent = games.length;
  }
  
  if (gamesStat) {
    gamesStat.textContent = games.length;
  }
  
  if (emptyState) {
    emptyState.style.display = games.length === 0 ? 'flex' : 'none';
  }
}

// 🔹 Инициализация поиска и фильтров
function initSearchAndFilters() {
  const searchInput = document.getElementById('search-input');
  const filterToggle = document.getElementById('filter-toggle');
  const filtersPanel = document.getElementById('filters-panel');
  const applyFilters = document.getElementById('apply-filters');
  const resetFilters = document.getElementById('reset-filters');
  
  if (!searchInput) return;
  
  // Заполняем фильтры
  populateFilters();
  
  // Поиск
  searchInput.addEventListener('input', filterGames);
  
  // Открыть/закрыть фильтры
  if (filterToggle) {
    filterToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      filtersPanel.classList.toggle('visible');
    });
  }
  
  // Применить фильтры
  if (applyFilters) {
    applyFilters.addEventListener('click', () => {
      collectFilters();
      filterGames();
      filtersPanel.classList.remove('visible');
    });
  }
  
  // Сбросить фильтры
  if (resetFilters) {
    resetFilters.addEventListener('click', () => {
      resetAllFilters();
      filterGames();
      filtersPanel.classList.remove('visible');
    });
  }
  
  // Закрыть фильтры при клике вне
  document.addEventListener('click', (e) => {
    if (filtersPanel && filterToggle && 
        !filtersPanel.contains(e.target) && 
        !filterToggle.contains(e.target)) {
      filtersPanel.classList.remove('visible');
    }
  });
}

// 🔹 Заполнение опций фильтров
function populateFilters() {
  if (games.length === 0) return;
  
  const genres = [...new Set(games.flatMap(g => g.genre || []))];
  const difficulties = [...new Set(games.map(g => g.difficulty).filter(Boolean))];
  const languages = [...new Set(games.flatMap(g => g.language || []))];
  
  const genreContainer = document.getElementById('genre-filters');
  const difficultyContainer = document.getElementById('difficulty-filters');
  const languageContainer = document.getElementById('language-filters');
  
  if (genreContainer) {
    genreContainer.innerHTML = genres.map(genre => `
      <label>
        <input type="checkbox" value="${genre}"> ${genre}
      </label>
    `).join('');
  }
  
  if (difficultyContainer) {
    difficultyContainer.innerHTML = difficulties.map(difficulty => `
      <label>
        <input type="checkbox" value="${difficulty}"> ${difficulty}
      </label>
    `).join('');
  }
  
  if (languageContainer) {
    languageContainer.innerHTML = languages.map(language => `
      <label>
        <input type="checkbox" value="${language}"> ${language}
      </label>
    `).join('');
  }
}

// 🔹 Сбор активных фильтров
function collectFilters() {
  activeFilters = {
    genres: [],
    difficulties: [],
    languages: []
  };
  
  document.querySelectorAll('#genre-filters input:checked').forEach(cb => {
    activeFilters.genres.push(cb.value);
  });
  
  document.querySelectorAll('#difficulty-filters input:checked').forEach(cb => {
    activeFilters.difficulties.push(cb.value);
  });
  
  document.querySelectorAll('#language-filters input:checked').forEach(cb => {
    activeFilters.languages.push(cb.value);
  });
}

// 🔹 Сброс всех фильтров
function resetAllFilters() {
  document.querySelectorAll('.filter-options input').forEach(cb => {
    cb.checked = false;
  });
  activeFilters = {
    genres: [],
    difficulties: [],
    languages: []
  };
  
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.value = '';
  }
}

// 🔹 Фильтрация игр
function filterGames() {
  const searchInput = document.getElementById('search-input');
  const searchQuery = searchInput ? searchInput.value.toLowerCase() : '';
  
  filteredGames = games.filter(game => {
    // Поиск по тексту
    if (searchQuery) {
      const searchableText = `
        ${game.title?.toLowerCase() || ''} 
        ${game.description?.toLowerCase() || ''} 
        ${(game.genre || []).join(' ').toLowerCase()} 
        ${(game.tags || []).join(' ').toLowerCase()}
        ${game.author?.toLowerCase() || ''}
      `;
      if (!searchableText.includes(searchQuery)) return false;
    }
    
    // Фильтр по жанрам
    if (activeFilters.genres.length > 0) {
      if (!game.genre || !game.genre.some(g => activeFilters.genres.includes(g))) return false;
    }
    
    // Фильтр по сложности
    if (activeFilters.difficulties.length > 0) {
      if (!game.difficulty || !activeFilters.difficulties.includes(game.difficulty)) return false;
    }
    
    // Фильтр по языкам
    if (activeFilters.languages.length > 0) {
      if (!game.language || !game.language.some(l => activeFilters.languages.includes(l))) return false;
    }
    
    return true;
  });
  
  renderGameList();
}

// 🔹 Рендер списка игр (адаптировано под ваш JSON)
function renderGameList() {
  const listEl = document.getElementById('game-list');
  if (!listEl) return;
  
  if (filteredGames.length === 0) {
    listEl.innerHTML = `
      <div class="no-results">
        <h3>😕 Ничего не найдено</h3>
        <p>Попробуйте изменить параметры поиска</p>
      </div>
    `;
    return;
  }
  
  listEl.innerHTML = '';
  
  filteredGames.forEach((game, index) => {
    const originalIndex = games.findIndex(g => g.title === game.title);
    const card = document.createElement('div');
    card.className = 'roblox-game-card';
    
    // Берем первый скриншот как превью, если нет image
    const previewImage = game.image || (game.screenshots && game.screenshots[0]) || 'https://via.placeholder.com/300x200?text=No+Image';
    
    card.innerHTML = `
      <div class="roblox-card-image">
        <img src="${previewImage}" 
             alt="${game.title}"
             onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
        <div class="roblox-card-badge">
          <span>⭐</span> ${game.rating || '?'}/5
        </div>
      </div>
      <div class="roblox-card-content">
        <div class="roblox-card-header">
          <h3>${game.title || 'Без названия'}</h3>
        </div>
        <div class="roblox-card-meta">
          <span class="roblox-genre">${(game.genre && game.genre[0]) || 'Разное'}</span>
          <span class="roblox-players">🎮 ${game.difficulty || 'Любая'}</span>
        </div>
        <p style="color: var(--text-light); font-size: 14px; margin: 10px 0;">
          ${(game.description || '').substring(0, 100)}...
        </p>
        <div class="roblox-card-tags">
          ${(game.tags || []).slice(0, 3).map(tag => 
            `<span class="roblox-tag">${tag}</span>`
          ).join('')}
        </div>
      </div>
    `;
    
    card.onclick = () => {
      window.location.href = `game.html?id=${originalIndex}`;
    };
    
    listEl.appendChild(card);
  });
}

// 🔹 Загрузка страницы игры (адаптировано под ваш JSON)
function loadGamePage() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  
  if (!id || !games[id]) {
    showGameNotFound();
    return;
  }

  const game = games[id];
  document.title = (game.title || 'Игра') + ' — Akanchik Games';

  // Заполняем информацию
  setTextContent('game-title', game.title || 'Без названия');
  setTextContent('game-description', game.description || 'Описание отсутствует');
  setTextContent('game-author', `👤 ${game.author || 'Неизвестный разработчик'}`);
  setTextContent('game-category', game.category || 'Игра');
  setTextContent('game-release', game.releaseDate || 'Дата не указана');
  setTextContent('game-rating', `${game.rating || '?'}/5`);
  setTextContent('game-duration', game.duration || 'Не указано');
  setTextContent('game-difficulty', game.difficulty || 'Не указана');
  setTextContent('game-controls', game.controls || 'Управление не указано');
  
  // Жанры
  const genreEl = document.getElementById('game-genre');
  if (genreEl && game.genre) {
    genreEl.innerHTML = game.genre.map(g => 
      `<span class="roblox-tag-blue">${g}</span>`
    ).join('');
  }
  
  // Теги
  const tagsEl = document.getElementById('game-tags');
  if (tagsEl && game.tags) {
    tagsEl.innerHTML = game.tags.map(tag => 
      `<span class="roblox-tag-blue">${tag}</span>`
    ).join('');
  }
  
  // Языки
  const languageEl = document.getElementById('game-language');
  if (languageEl && game.language) {
    languageEl.innerHTML = game.language.map(lang => 
      `<span class="roblox-tag-green">${lang}</span>`
    ).join('');
  }
  
  // Особенности
  const featuresEl = document.getElementById('game-features-list');
  if (featuresEl && game.features) {
    featuresEl.innerHTML = game.features.map(feature => 
      `<li>${feature}</li>`
    ).join('');
  }
  
  // Видео
  const mediaEl = document.getElementById('game-media');
  if (mediaEl) {
    if (game.video) {
      mediaEl.innerHTML = `
        <iframe src="${toEmbedUrl(game.video)}" 
                frameborder="0" 
                allowfullscreen
                style="width: 100%; height: 100%;">
        </iframe>
      `;
    } else {
      mediaEl.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: white; background: #333;">
          🎥 Видео отсутствует
        </div>
      `;
    }
  }
  
  // Галерея скриншотов
  const galleryEl = document.getElementById('screenshot-gallery');
  if (galleryEl && game.screenshots && game.screenshots.length > 0) {
    galleryEl.innerHTML = game.screenshots.map((src, i) => `
      <div class="roblox-gallery-thumb ${i === 0 ? 'active' : ''}" 
           onclick="changeScreenshot(${i})">
        <img src="${src}" alt="Скриншот ${i + 1}" onerror="this.src='https://via.placeholder.com/150?text=Error'">
      </div>
    `).join('');
  } else if (galleryEl) {
    galleryEl.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: #666;">Нет скриншотов</div>';
  }
  
  // Кнопка игры
  const playButton = document.getElementById('play-button');
  if (playButton) {
    playButton.onclick = () => {
      if (game.itchPageUrl && game.itchPageUrl !== 'https://itch.io/') {
        window.open(game.itchPageUrl, '_blank');
      } else if (game.itchEmbedUrl) {
        window.open(game.itchEmbedUrl, '_blank');
      } else {
        alert('🔗 Ссылка на игру не указана');
      }
    };
  }
}

// 🔹 Вспомогательная функция
function setTextContent(elementId, text) {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = text;
  }
}

// 🔹 Показать ошибку
function showGameNotFound() {
  const main = document.querySelector('main');
  if (main) {
    main.innerHTML = `
      <div style="text-align: center; padding: 100px 20px;">
        <h2 style="color: #FF4444;">😕 Игра не найдена</h2>
        <p>Возможно, она была удалена</p>
        <a href="index.html" style="
          display: inline-block;
          margin-top: 20px;
          background: #00A2FF;
          color: white;
          padding: 12px 24px;
          border-radius: 40px;
          text-decoration: none;
          font-weight: 600;
        ">← На главную</a>
      </div>
    `;
  }
}

// 🔹 Преобразование YouTube ссылок
function toEmbedUrl(url) {
  if (!url) return '';
  try {
    const u = new URL(url);
    if (u.hostname === 'youtu.be') {
      return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    }
    if (u.hostname.includes('youtube.com')) {
      const v = u.searchParams.get('v');
      if (v) return `https://www.youtube.com/embed/${v}`;
    }
  } catch(e) {}
  return url;
}

// 🔹 Смена скриншота
function changeScreenshot(index) {
  const thumbnails = document.querySelectorAll('.roblox-gallery-thumb');
  thumbnails.forEach(t => t.classList.remove('active'));
  thumbnails[index]?.classList.add('active');
}

// 🔹 Поделиться
function shareGame() {
  const gameId = new URLSearchParams(window.location.search).get('id');
  if (!gameId || !games[gameId]) return;
  
  const game = games[gameId];
  const url = window.location.href;
  
  if (navigator.share) {
    navigator.share({
      title: game.title,
      text: game.description,
      url: url
    });
  } else {
    navigator.clipboard.writeText(url);
    alert('✅ Ссылка скопирована в буфер обмена!');
  }
}

// 🔹 В избранное
function addToFavorites() {
  const gameId = new URLSearchParams(window.location.search).get('id');
  if (!gameId || !games[gameId]) return;
  
  const game = games[gameId];
  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  
  if (!favorites.includes(gameId)) {
    favorites.push(gameId);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    alert(`❤️ "${game.title}" добавлена в избранное!`);
  } else {
    alert(`"${game.title}" уже в избранном`);
  }
}

// Делаем функции глобальными
window.changeScreenshot = changeScreenshot;
window.shareGame = shareGame;
window.addToFavorites = addToFavorites;
