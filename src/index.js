const Game = require('./game');

(async () => {
    const game = new Game(document.getElementById('coke-music-container'));
    await game.start();
})();
