let games = [];
let currentScreenshotIndex = 0;

fetch('games.json')
  .then(res => res.json())
  .then(data => {
    games = data;
    const listEl = document.getElementById('game-list');
    if (listEl) renderGameList(); // если мы на главной
    else loadGamePage();          // если мы на странице игры
  });

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
      <img src="${game.image}" alt="${game.title}" loading="lazy">
      <h3>${game.title}</h3>
      <p class="game-preview">${game.description.substring(0, 100)}...</p>
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

  document.getElementById('game-title').textContent = game.title;
  document.getElementById('game-description').textContent = game.description;
  
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

  // Кнопка игры - теперь используем универсальный embed
  document.getElementById('play-button').onclick = () => {
    if (game.itchEmbedUrl) {
      // Перенаправляем на универсальную страницу с embed
      window.location.href = `game-embed.html?id=${id}`;
    } else if (game.itchPageUrl) {
      // Открываем страницу itch.io в новой вкладке
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
  alert('Игра добавлена в избранное!');
}
