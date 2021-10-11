const Game = require('./game');

(async () => {
    const game = new Game(document.getElementById('coke-music-container'));
    await game.start();

    const { colourizeImage } = require('./draw');
    const nameCanvas= document.createElement('canvas');
    nameCanvas.width = 228;
    nameCanvas.height = 23;
    const nameContext = nameCanvas.getContext('2d');
    const nameImage = document.createElement('img');
    nameImage.onload =() =>  {
        console.log(nameImage.width, nameImage.height);
        nameContext.drawImage(nameImage, 0, 0);
        colourizeImage(nameCanvas, { r: 80, g: 80, b: 80});
    };
    nameImage.src='/assets/message_name.png';
    document.body.appendChild(nameCanvas);
})();
