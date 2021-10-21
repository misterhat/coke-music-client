const rugs = require('coke-music-data/rugs.json');

class Rug {
    constructor(game, room, { name }) {
        this.game = game;
        this.room = room;

        this.name = name;

        Object.assign(this, rugs[name]);

        this.x = -1;
        this.y = -1;

        this.width = Math.floor(this.tileWidth * 70);
        this.height = Math.floor(this.tileHeight * 36);

        this.drawX = 0;
        this.drawY = 0;
    }

    update() {
        const { x: drawX, y: drawY } = this.room.isoToCoordinate(
            this.x - 1,
            this.y + 1
        );

        this.drawX = drawX;
        this.drawY = drawY;
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
            this.drawX - 4,
            this.drawY - 4
        );

        context.globalAlpha = 1;
    }
}

module.exports = Rug;
