const furniture = require('coke-music-data/furniture.json');

class GameObject {
    constructor(game, room, { name }) {
        this.game = game;
        this.room = room;

        this.name = name;

        Object.assign(this, furniture[name]);

        this.angle = 1;
        this.x = 1;
        this.y = 1;

        this.drawX = 0;
        this.drawY = 0;
    }

    update() {
        const { x: drawX, y: drawY } = this.room.isoToCoordinate(
            this.x,
            this.y
        );

        this.drawX = drawX;
        this.drawY = drawY - (this.height / 2);
    }

    draw() {
        const { context } = this.game;

        context.drawImage(
            this.game.images[`/furniture/${this.name}.png`],
            this.angle * this.width,
            0,
            this.width,
            this.height,
            this.drawX,
            this.drawY,
            this.width,
            this.height
        );
    }
}

module.exports = GameObject;
