class Entry {
    constructor(game) {
        this.game = game;
    }

    init() {
        this.game.navigation.init({ isEntry: true });

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
        this.game.navigation.destroy();
    }
}

module.exports = Entry;
