let games = [];
let currentScreenshotIndex = 0;

fetch('games.json')
  .then(res => res.json())
  .then(data => {
    games = data;
    const listEl = document.getElementById('game-list');
    if (listEl) {
      renderGameList(); // если мы на главной
      updateGamesCounter(); // обновляем счетчик
    } else {
      loadGamePage(); // если мы на странице игры
    }
  });

// 🔹 Обновляем счетчик игр
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

// 🔹 Функция для списка игр
function renderGameList() {
  const listEl = document.getElementById('game-list');
  listEl.innerHTML = '';
  
  // Если игр мало - используем другую раскладку
  if (games.length <= 2) {
    listEl.style.gridTemplateColumns = 'repeat(auto-fit, minmax(280px, 1fr))';
    listEl.style.maxWidth = '800px';
    listEl.style.margin = '0 auto';
  }
  
  games.forEach((game, i) => {
    const card = document.createElement('div');
    card.className = 'game-card';
    card.innerHTML = `
      <div class="card-image">
        <img src="${game.image}" alt="${game.title}" loading="lazy">
        <div class="card-badge">${game.category}</div>
      </div>
      <div class="card-content">
        <h3>${game.title}</h3>
        <div class="card-meta">
          <span class="rating">⭐ ${game.rating}/5</span>
          <span class="genre">${game.genre[0]}</span>
        </div>
        <p class="game-preview">${game.description.substring(0, 100)}...</p>
        <div class="card-tags">
          ${game.tags.slice(0, 2).map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
      </div>
    `;
    card.onclick = () => {
      window.location.href = `game.html?id=${i}`;
    };
    listEl.appendChild(card);
  });
}

// 🔹 Функция для страницы игры
function loadGamePage() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (!id || !games[id]) {
    document.body.innerHTML = '<p style="text-align:center;">Игра не найдена</p>';
    return;
  }

  const game = games[id];
  document.title = game.title + ' — Akanchik Games';

  // Заполняем основную информацию
  document.getElementById('game-title').textContent = game.title;
  document.getElementById('game-description').textContent = game.description;
  
  // Заполняем мета-информацию
  document.getElementById('game-rating').textContent = `⭐ ${game.rating}/5`;
  document.getElementById('game-category').textContent = game.category;
  document.getElementById('game-author').textContent = `Разработчик: ${game.author}`;
  document.getElementById('game-release').textContent = `Релиз: ${game.releaseDate}`;
  document.getElementById('game-duration').textContent = `Время игры: ${game.duration}`;
  document.getElementById('game-difficulty').textContent = `Сложность: ${game.difficulty}`;
  
  // Заполняем жанры
  const genreEl = document.getElementById('game-genre');
  genreEl.innerHTML = game.genre.map(g => `<span class="genre-tag">${g}</span>`).join('');
  
  // Заполняем теги
  const tagsEl = document.getElementById('game-tags');
  tagsEl.innerHTML = game.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
  
  // Заполняем языки
  const languageEl = document.getElementById('game-language');
  languageEl.innerHTML = game.language.map(lang => `<span class="lang-tag">${lang}</span>`).join('');
  
  // Заполняем особенности
  const featuresEl = document.getElementById('game-features-list');
  featuresEl.innerHTML = game.features.map(feature => `<li>${feature}</li>`).join('');
  
  // Заполняем управление
  document.getElementById('game-controls').textContent = game.controls;

  const mediaEl = document.getElementById('game-media');
  mediaEl.innerHTML = '';

  // Видео
  if (game.video) {
    const videoContainer = document.createElement('div');
    videoContainer.className = 'video-container';
    const iframe = document.createElement('iframe');
    iframe.src = toEmbedUrl(game.video);
    iframe.allowFullscreen = true;
    videoContainer.appendChild(iframe);
    mediaEl.appendChild(videoContainer);
  }

  // Галерея скриншотов с навигацией
  if (game.screenshots && game.screenshots.length > 0) {
    const gallery = document.createElement('div');
    gallery.className = 'screenshot-gallery';
    
    gallery.innerHTML = `
      <div class="gallery-container">
        <button class="gallery-nav gallery-prev" onclick="changeScreenshot(-1)">‹</button>
        <div class="gallery-viewport">
          <img id="current-screenshot" src="${game.screenshots[0]}" alt="Скриншот игры">
        </div>
        <button class="gallery-nav gallery-next" onclick="changeScreenshot(1)">›</button>
      </div>
      <div class="gallery-indicator">
        <span id="gallery-counter">1 / ${game.screenshots.length}</span>
      </div>
    `;
    
    mediaEl.appendChild(gallery);
  }

  // Кнопка игры
  document.getElementById('play-button').onclick = () => {
    if (game.itchEmbedUrl) {
      window.location.href = `game-embed.html?id=${id}`;
    } else if (game.itchPageUrl) {
      window.open(game.itchPageUrl, '_blank');
    } else {
      alert('Ссылка на игру не указана.');
    }
  };
}

// 🔹 Навигация по галерее
function changeScreenshot(direction) {
  const gameId = new URLSearchParams(window.location.search).get('id');
  const game = games[gameId];
  const screenshots = game.screenshots;
  
  currentScreenshotIndex += direction;
  
  if (currentScreenshotIndex < 0) {
    currentScreenshotIndex = screenshots.length - 1;
  } else if (currentScreenshotIndex >= screenshots.length) {
    currentScreenshotIndex = 0;
  }
  
  document.getElementById('current-screenshot').src = screenshots[currentScreenshotIndex];
  document.getElementById('gallery-counter').textContent = `${currentScreenshotIndex + 1} / ${screenshots.length}`;
}

// 🔹 Преобразуем YouTube-ссылки в embed
function toEmbedUrl(url) {
  try {
    const u = new URL(url);
    if (u.hostname === 'youtu.be') return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    if (u.hostname.includes('youtube.com')) {
      const v = u.searchParams.get('v');
      if (v) return `https://www.youtube.com/embed/${v}`;
    }
  } catch(e) {}
  return url;
}

// 🔹 Вспомогательные функции для кнопок
function shareGame() {
  const gameId = new URLSearchParams(window.location.search).get('id');
  const game = games[gameId];
  const shareUrl = window.location.href;
  
  if (navigator.share) {
    navigator.share({
      title: game.title,
      text: game.description,
      url: shareUrl,
    });
  } else {
    navigator.clipboard.writeText(shareUrl);
    alert('Ссылка на игру скопирована в буфер обмена!');
  }
}

function addToFavorites() {
  const gameId = new URLSearchParams(window.location.search).get('id');
  const game = games[gameId];
  
  // Сохраняем в localStorage
  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  if (!favorites.includes(gameId)) {
    favorites.push(gameId);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    alert(`"${game.title}" добавлена в избранное! ❤️`);
  } else {
    alert('Игра уже в избранном!');
  }
}
