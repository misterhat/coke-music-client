const furniture = require('coke-music-data/furniture.json');
const { createCanvas } = require('./draw');

// ne, sw, nw, se

// { objectAngle: characterAngle }
const SIT_ANGLES = {
    0: 0,
    1: 7,
    2: 5,
    3: 2
};

class GameObject {
    constructor(game, room, { name, x, y, angle }) {
        this.game = game;
        this.room = room;

        this.name = name;

        Object.assign(this, furniture[name]);

        this.edit = false;

        this.angle = angle || 0;
        this.x = x;
        this.y = y;

        this.sitters = new Set();

        this.oldX = -1;
        this.oldY = -1;

        this.drawX = 0;
        this.drawY = 0;

        this.foreground = this.game.images[
            `/furniture/${this.name}_foreground.png`
        ];
    }

    getTileWidth() {
        return this.angles[this.angle] <= 1 ? this.tileWidth : this.tileHeight;
    }

    getTileHeight() {
        return this.angles[this.angle] <= 1 ? this.tileHeight : this.tileWidth;
    }

    rotate() {
        this.angle = (this.angle + 1) % this.angles.length;
    }

    clipForeground() {}

    isBlocked() {
        if (this.x < 0 || this.y < 0) {
            return true;
        }

        const width = this.getTileWidth();
        const height = this.getTileHeight();

        for (let y = this.y; y < this.y + height; y += 1) {
            if (y >= this.room.height) {
                return true;
            }

            for (let x = this.x; x < this.x + width; x += 1) {
                if (x >= this.room.width) {
                    return true;
                }

                if (this.room.map[y][x]) {
                    return true;
                }

                const tileEntity = this.room.drawableGrid[y][x];

                if (
                    tileEntity &&
                    tileEntity !==
                        this /*&&
                    tileEntity.constructor.name === 'GameObject'*/
                ) {
                    return true;
                }
            }
        }

        return false;
    }

    update() {
        const isoX = this.x;

        const isoY =
            this.y +
            (this.angles[this.angle] > 1 && this.tileWidth > 1 ? 1 : 0);

        const { x: drawX, y: drawY } = this.room.isoToCoordinate(isoX, isoY);

        this.drawX = drawX + this.offsetX;

        this.drawY =
            drawY -
            this.height +
            36 +
            (this.angles[this.angle] <= 1 ? this.offsetY : 0);

        for (const character of this.sitters.values()) {
            character.angle = SIT_ANGLES[this.angles[this.angle]];
        }
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
            this.angles[this.angle] * this.width,
            0,
            this.width,
            this.height,
            this.drawX,
            this.drawY,
            this.width,
            this.height
        );

        for (const character of this.sitters) {
            character.draw();
        }

        if (this.foreground) {
            context.drawImage(
                this.foreground,
                this.angles[this.angle] * this.width,
                0,
                this.width,
                this.height,
                this.drawX,
                this.drawY,
                this.width,
                this.height
            );
        }

        context.globalAlpha = 1;
    }
}

module.exports = GameObject;
