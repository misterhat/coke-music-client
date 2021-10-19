const furniture = require('coke-music-data/furniture.json');

// ne, sw, nw, se

class GameObject {
    constructor(game, room, { name }) {
        this.game = game;
        this.room = room;

        this.name = name;

        Object.assign(this, furniture[name]);

        this.edit = false;

        this.angle = 0;
        this.x = -1;
        this.y = -1;

        this.drawX = 0;
        this.drawY = 0;
    }

    getTileWidth() {
        return this.angle <= 1 ? this.tileWidth : this.tileHeight;
    }

    getTileHeight() {
        return this.angle <= 1 ? this.tileHeight : this.tileWidth;
    }

    rotate() {
        this.angle = (this.angle + 1) % this.angles;
    }

    update() {
        const isoX = this.x;
        const isoY = this.y + (this.angle > 1 ? 1 : 0);

        const { x: drawX, y: drawY } = this.room.isoToCoordinate(
            isoX,
            isoY
        );

        this.drawX = drawX;
        this.drawY = drawY - (this.height / 2);
    }

    draw() {
        if (this.x === -1 || this.y === -1) {
            return;
        }

        const { context } = this.game;

        if (this.edit) {
            context.globalAlpha = 0.5;
        }

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

        context.globalAlpha = 1;
    }
}

module.exports = GameObject;
