const posters = require('coke-music-data/posters.json');
const { flipImage } = require('../draw');

const WALL_HEIGHT = 130;

class Poster {
    constructor(game, room, { name, x, y }) {
        this.game = game;
        this.room = room;

        this.name = name;

        Object.assign(this, posters[name]);

        this.edit = false;

        this.x = x;
        this.y = y;

        this.drawX = 0;
        this.drawY = 0;

        this.leftImage = this.game.images[`/furniture/${this.name}.png`];
        this.rightImage = flipImage(this.leftImage);

        this.image = this.leftImage;
    }

    isBlocked() {
        // TODO
    }

    update() {
        const { offsetX, offsetY, orientation } = this.room.walls[this.x];

        this.drawX = offsetX + this.room.backgroundOffsetX + this.y;

        this.drawY =
            offsetY +
            (WALL_HEIGHT / 2 - this.image.height / 2) +
            this.room.backgroundOffsetY +
            (this.y / 2) * (orientation === 'left' ? -1 : 1);

        if (orientation === 'left') {
            this.image = this.leftImage;
        } else {
            this.image = this.rightImage;
        }
    }

    draw() {
        const { context } = this.game;

        if (this.edit) {
            context.globalAlpha = 0.5;
        }

        context.drawImage(this.image, this.drawX, this.drawY);

        context.globalAlpha = 1;
    }
}

module.exports = Poster;
