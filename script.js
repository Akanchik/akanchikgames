let games = [];

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
  games.forEach((game, i) => {
    const card = document.createElement('div');
    card.className = 'game-card';
    card.innerHTML = `
      <img src="${game.image}" alt="${game.title}">
      <h3>${game.title}</h3>
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

  if (game.video) {
    const iframe = document.createElement('iframe');
    iframe.src = toEmbedUrl(game.video);
    iframe.allowFullscreen = true;
    mediaEl.appendChild(iframe);
  }

  game.screenshots.forEach(src => {
    const img = document.createElement('img');
    img.src = src;
    mediaEl.appendChild(img);
  });

  document.getElementById('play-button').onclick = () => {
  if (game.playFile) {
    window.location.href = game.playFile; // локальный HTML-файл
  } else if (game.playLink) {
    window.open(game.playLink, '_blank'); // если всё-таки ссылка
  } else {
    alert('Файл игры не указан.');
  }
};
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
