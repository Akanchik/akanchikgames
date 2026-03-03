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
fetch('games.json')
  .then(res => res.json())
  .then(data => {
    games = data;
    filteredGames = [...games];
    const listEl = document.getElementById('game-list');
    if (listEl) {
      renderGameList();
      updateGamesCounter();
      initSearchAndFilters();
    } else {
      loadGamePage();
    }
  })
  .catch(error => {
    console.error('Ошибка загрузки игр:', error);
    showError();
  });

// Показать ошибку загрузки
function showError() {
  const listEl = document.getElementById('game-list');
  if (listEl) {
    listEl.innerHTML = `
      <div class="no-results">
        <h3>❌ Ошибка загрузки</h3>
        <p>Не удалось загрузить список игр. Попробуйте обновить страницу.</p>
      </div>
    `;
  }
}

// 🔹 Обновление счетчика игр
function updateGamesCounter() {
  const counter = document.getElementById('games-count');
  const emptyState = document.getElementById('empty-state');
  
  if (counter) {
    counter.textContent = games.length;
  }
  
  if (emptyState) {
    emptyState.style.display = games.length === 0 ? 'flex' : 'none';
  }
}

// 🔹 Инициализация поиска и фильтров
function initSearchAndFilters() {
  const searchInput = document.getElementById('search-input');
  const searchClear = document.getElementById('search-clear');
  const filterToggle = document.getElementById('filter-toggle');
  const filtersPanel = document.getElementById('filters-panel');
  const applyFilters = document.getElementById('apply-filters');
  const resetFilters = document.getElementById('reset-filters');
  
  if (!searchInput) return; // Если не на главной странице
  
  // Заполняем фильтры
  populateFilters();
  
  // Поиск при вводе
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    searchClear.classList.toggle('visible', query.length > 0);
    filterGames();
  });
  
  // Очистка поиска
  searchClear.addEventListener('click', () => {
    searchInput.value = '';
    searchClear.classList.remove('visible');
    filterGames();
  });
  
  // Открыть/закрыть фильтры
  filterToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    filtersPanel.classList.toggle('visible');
  });
  
  // Применить фильтры
  applyFilters.addEventListener('click', () => {
    collectFilters();
    filterGames();
    filtersPanel.classList.remove('visible');
  });
  
  // Сбросить фильтры
  resetFilters.addEventListener('click', () => {
    resetAllFilters();
    filterGames();
    filtersPanel.classList.remove('visible');
  });
  
  // Закрыть фильтры при клике вне
  document.addEventListener('click', (e) => {
    if (!filtersPanel.contains(e.target) && !filterToggle.contains(e.target)) {
      filtersPanel.classList.remove('visible');
    }
  });
  
  // Обновить статистику при загрузке
  updateSearchStats();
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
    document.getElementById('search-clear').classList.remove('visible');
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
  
  updateSearchStats();
  renderGameList();
}

// 🔹 Обновление статистики поиска
function updateSearchStats() {
  const statsEl = document.getElementById('search-stats');
  const countEl = document.getElementById('search-count');
  if (countEl) {
    countEl.textContent = filteredGames.length;
  }
}

// 🔹 Рендер списка игр
function renderGameList() {
  const listEl = document.getElementById('game-list');
  const emptyState = document.getElementById('empty-state');
  
  if (!listEl) return;
  
  listEl.innerHTML = '';
  
  if (filteredGames.length === 0) {
    listEl.innerHTML = `
      <div class="no-results">
        <h3>😕 Ничего не найдено</h3>
        <p>Попробуйте изменить параметры поиска или фильтры</p>
      </div>
    `;
    return;
  }
  
  // Если игр мало - используем другую раскладку
  if (filteredGames.length <= 2) {
    listEl.style.gridTemplateColumns = 'repeat(auto-fit, minmax(280px, 1fr))';
    listEl.style.maxWidth = '800px';
    listEl.style.margin = '0 auto';
  } else {
    listEl.style.gridTemplateColumns = '';
    listEl.style.maxWidth = '';
    listEl.style.margin = '';
  }
  
  filteredGames.forEach((game) => {
    const originalIndex = games.findIndex(g => g.title === game.title);
    const card = document.createElement('div');
    card.className = 'game-card';
    card.innerHTML = `
      <div class="card-image">
        <img src="${game.image || 'placeholder.jpg'}" alt="${game.title || 'Игра'}" loading="lazy" onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
        <div class="card-badge">${game.category || 'Игра'}</div>
      </div>
      <div class="card-content">
        <h3>${game.title || 'Без названия'}</h3>
        <div class="card-meta">
          <span class="rating">⭐ ${game.rating || '0'}/5</span>
          <span class="genre">${(game.genre && game.genre[0]) || 'Разное'}</span>
        </div>
        <p class="game-preview">${(game.description || '').substring(0, 100)}${game.description && game.description.length > 100 ? '...' : ''}</p>
        <div class="card-tags">
          ${(game.tags || []).slice(0, 2).map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
      </div>
    `;
    card.onclick = () => {
      window.location.href = `game.html?id=${originalIndex}`;
    };
    listEl.appendChild(card);
  });
}

// 🔹 Загрузка страницы игры
function loadGamePage() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  
  if (!id || !games[id]) {
    showGameNotFound();
    return;
  }

  const game = games[id];
  document.title = (game.title || 'Игра') + ' — Akanchik Games';

  // Заполняем основную информацию
  setTextContent('game-title', game.title || 'Без названия');
  setTextContent('game-description', game.description || 'Описание отсутствует');
  setTextContent('game-rating', `⭐ ${game.rating || '?'}/5`);
  setTextContent('game-category', game.category || 'Без категории');
  setTextContent('game-author', `👤 ${game.author || 'Неизвестный разработчик'}`);
  setTextContent('game-release', game.releaseDate ? `📅 ${game.releaseDate}` : '📅 Дата не указана');
  setTextContent('game-duration', game.duration ? `⏱️ ${game.duration}` : '⏱️ Не указано');
  setTextContent('game-difficulty', game.difficulty ? `📊 ${game.difficulty}` : '📊 Не указана');
  setTextContent('game-controls', game.controls || 'Управление не указано');
  
  // Заполняем жанры
  const genreEl = document.getElementById('game-genre');
  if (genreEl && game.genre) {
    genreEl.innerHTML = game.genre.map(g => `<span class="genre-tag">${g}</span>`).join('');
  }
  
  // Заполняем теги
  const tagsEl = document.getElementById('game-tags');
  if (tagsEl && game.tags) {
    tagsEl.innerHTML = game.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
  }
  
  // Заполняем языки
  const languageEl = document.getElementById('game-language');
  if (languageEl && game.language) {
    languageEl.innerHTML = game.language.map(lang => `<span class="lang-tag">${lang}</span>`).join('');
  }
  
  // Заполняем особенности
  const featuresEl = document.getElementById('game-features-list');
  if (featuresEl && game.features) {
    featuresEl.innerHTML = game.features.map(feature => `<li>${feature}</li>`).join('');
  }

  // Медиа секция
  const mediaEl = document.getElementById('game-media');
  if (mediaEl) {
    mediaEl.innerHTML = '';

    // Видео
    if (game.video) {
      const videoContainer = document.createElement('div');
      videoContainer.className = 'video-container';
      const iframe = document.createElement('iframe');
      iframe.src = toEmbedUrl(game.video);
      iframe.allowFullscreen = true;
      iframe.title = `${game.title} видео`;
      videoContainer.appendChild(iframe);
      mediaEl.appendChild(videoContainer);
    }

    // Галерея скриншотов
    if (game.screenshots && game.screenshots.length > 0) {
      const gallery = createScreenshotGallery(game.screenshots);
      mediaEl.appendChild(gallery);
    }
  }

  // Кнопка игры
  const playButton = document.getElementById('play-button');
  if (playButton) {
    playButton.onclick = () => {
      if (game.itchEmbedUrl) {
        window.location.href = `game-embed.html?id=${id}`;
      } else if (game.itchPageUrl) {
        window.open(game.itchPageUrl, '_blank');
      } else if (game.externalUrl) {
        window.open(game.externalUrl, '_blank');
      } else {
        alert('🔗 Ссылка на игру не указана');
      }
    };
  }
}

// 🔹 Вспомогательная функция для установки текста
function setTextContent(elementId, text) {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = text;
  }
}

// 🔹 Показать ошибку "Игра не найдена"
function showGameNotFound() {
  const main = document.querySelector('main');
  if (main) {
    main.innerHTML = `
      <div class="game-info" style="text-align: center; padding: 100px 20px;">
        <h2>😕 Игра не найдена</h2>
        <p>Возможно, она была удалена или ссылка неверна</p>
        <a href="index.html" class="back-link" style="display: inline-block; margin-top: 20px;">← Вернуться на главную</a>
      </div>
    `;
  }
}

// 🔹 Создание галереи скриншотов
function createScreenshotGallery(screenshots) {
  const gallery = document.createElement('div');
  gallery.className = 'screenshot-gallery';
  
  gallery.innerHTML = `
    <div class="gallery-container">
      <button class="gallery-nav gallery-prev" onclick="changeScreenshot(-1)">‹</button>
      <div class="gallery-viewport">
        <img id="current-screenshot" src="${screenshots[0]}" alt="Скриншот игры" onerror="this.src='https://via.placeholder.com/600x400?text=Screenshot+Not+Available'">
      </div>
      <button class="gallery-nav gallery-next" onclick="changeScreenshot(1)">›</button>
    </div>
    <div class="gallery-indicator">
      <span id="gallery-counter">1 / ${screenshots.length}</span>
    </div>
  `;
  
  return gallery;
}

// 🔹 Навигация по галерее
function changeScreenshot(direction) {
  const gameId = new URLSearchParams(window.location.search).get('id');
  if (!gameId || !games[gameId]) return;
  
  const game = games[gameId];
  const screenshots = game.screenshots;
  if (!screenshots || screenshots.length === 0) return;
  
  currentScreenshotIndex += direction;
  
  if (currentScreenshotIndex < 0) {
    currentScreenshotIndex = screenshots.length - 1;
  } else if (currentScreenshotIndex >= screenshots.length) {
    currentScreenshotIndex = 0;
  }
  
  const img = document.getElementById('current-screenshot');
  const counter = document.getElementById('gallery-counter');
  
  if (img) {
    img.src = screenshots[currentScreenshotIndex];
  }
  if (counter) {
    counter.textContent = `${currentScreenshotIndex + 1} / ${screenshots.length}`;
  }
}

// 🔹 Преобразование YouTube ссылок в embed
function toEmbedUrl(url) {
  if (!url) return url;
  
  try {
    const u = new URL(url);
    if (u.hostname === 'youtu.be') return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    if (u.hostname.includes('youtube.com')) {
      const v = u.searchParams.get('v');
      if (v) return `https://www.youtube.com/embed/${v}`;
    }
    if (u.hostname.includes('vimeo.com')) {
      const v = u.pathname.split('/').pop();
      return `https://player.vimeo.com/video/${v}`;
    }
  } catch(e) {
    console.log('Ошибка преобразования URL:', e);
  }
  return url;
}

// 🔹 Поделиться игрой
function shareGame() {
  const gameId = new URLSearchParams(window.location.search).get('id');
  if (!gameId || !games[gameId]) return;
  
  const game = games[gameId];
  const shareUrl = window.location.href;
  
  if (navigator.share) {
    navigator.share({
      title: game.title || 'Игра',
      text: game.description || 'Посмотрите эту игру на Akanchik Games',
      url: shareUrl,
    }).catch(() => {
      // Пользователь отменил шаринг
    });
  } else {
    // Копируем в буфер обмена
    navigator.clipboard.writeText(shareUrl).then(() => {
      showToast('✅ Ссылка скопирована в буфер обмена!');
    }).catch(() => {
      alert('📋 Ссылка: ' + shareUrl);
    });
  }
}

// 🔹 Добавить в избранное
function addToFavorites() {
  const gameId = new URLSearchParams(window.location.search).get('id');
  if (!gameId || !games[gameId]) return;
  
  const game = games[gameId];
  
  // Сохраняем в localStorage
  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  
  if (!favorites.includes(gameId)) {
    favorites.push(gameId);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    showToast(`❤️ "${game.title}" добавлена в избранное!`);
  } else {
    showToast(`💔 "${game.title}" уже в избранном`);
  }
}

// 🔹 Показать всплывающее уведомление
function showToast(message) {
  // Удаляем старый тост, если есть
  const oldToast = document.querySelector('.toast-notification');
  if (oldToast) {
    oldToast.remove();
  }
  
  // Создаем новый
  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--text);
    color: white;
    padding: 12px 24px;
    border-radius: 40px;
    font-size: 14px;
    font-weight: 500;
    z-index: 1000;
    animation: toastIn 0.3s ease;
    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  `;
  
  document.body.appendChild(toast);
  
  // Добавляем анимацию
  const style = document.createElement('style');
  style.textContent = `
    @keyframes toastIn {
      from { opacity: 0; transform: translate(-50%, 20px); }
      to { opacity: 1; transform: translate(-50%, 0); }
    }
  `;
  document.head.appendChild(style);
  
  // Удаляем через 3 секунды
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translate(-50%, 20px)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Делаем функции глобальными для вызова из HTML
window.changeScreenshot = changeScreenshot;
window.shareGame = shareGame;
window.addToFavorites = addToFavorites;
