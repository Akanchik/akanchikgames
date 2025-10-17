const gameListEl = document.getElementById('game-list');
const gameInfoEl = document.getElementById('game-info');
const backButton = document.getElementById('back-button');
const titleEl = document.getElementById('game-title');
const descEl = document.getElementById('game-description');
const mediaEl = document.getElementById('game-media');
const playButton = document.getElementById('play-button');

let games = [];

fetch('games.json')
  .then(res => res.json())
  .then(data => {
    games = data;
    renderGameList();
  });

function renderGameList() {
  gameListEl.innerHTML = '';
  games.forEach(game => {
    const card = document.createElement('div');
    card.className = 'game-card';
    card.innerHTML = `
      <img src="${game.image}" alt="${game.title}">
      <h3>${game.title}</h3>
    `;
    card.onclick = () => showGameInfo(game);
    gameListEl.appendChild(card);
  });
}

function showGameInfo(game) {
  gameListEl.classList.add('hidden');
  gameInfoEl.classList.remove('hidden');

  titleEl.textContent = game.title;
  descEl.textContent = game.description;

  mediaEl.innerHTML = '';

  if (game.video) {
    const iframe = document.createElement('iframe');
    iframe.src = game.video;
    iframe.width = "560";
    iframe.height = "315";
    iframe.allowFullscreen = true;
    mediaEl.appendChild(iframe);
  }

  game.screenshots.forEach(src => {
    const img = document.createElement('img');
    img.src = src;
    mediaEl.appendChild(img);
  });

  playButton.onclick = () => {
    window.location.href = game.playLink;
  };
}

backButton.onclick = () => {
  gameListEl.classList.remove('hidden');
  gameInfoEl.classList.add('hidden');
};
