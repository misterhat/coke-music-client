const Navigation  = require('./navigation');

class Entry {
    constructor(game) {
        this.game = game;

        this.navigation = new Navigation(this.game, true);
    }

    init() {
        this.navigation.init();

        this.backgroundImage = this.game.images['/entry.png'];

        this.backgroundOffsetX = Math.floor(
            this.game.canvas.width / 2 - this.backgroundImage.width / 2
        );

        this.backgroundOffsetY = Math.floor(
            this.game.canvas.height / 2 - this.backgroundImage.height / 2
        );
    }

    update() {}

    draw() {
        const { context } = this.game;

        context.drawImage(
            this.backgroundImage,
            this.backgroundOffsetX,
            this.backgroundOffsetY
        );
    }

    destroy() {
        this.navigation.destroy();
    }
}

module.exports = Entry;
