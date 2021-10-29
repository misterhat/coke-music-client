const WALL_HEIGHT = 130;

class Poster {
    constructor(game, room, { name, x, y }) {
        this.game = game;
        this.room = room;

        this.name = name;

        this.x = x;
        this.y = y;
        this.z = 0;

        // 48 + 98

        console.log(this.x);
        console.log(
            this.room.walls[this.x].offsetX,
            this.room.walls[this.x].offsetY
        );

        this.image = this.game.images[`/furniture/${this.name}.png`];
    }

    update() {
        this.drawX =
            this.room.walls[this.x].offsetX +
            this.room.backgroundOffsetX +
            this.z;

        this.drawY =
            this.room.walls[this.x].offsetY +
            (WALL_HEIGHT / 2 - this.image.height / 2) +
            this.room.backgroundOffsetY -
            this.z / 2;
    }

    draw() {
        const { context } = this.game;

        context.drawImage(this.image, this.drawX, this.drawY);
    }
}

module.exports = Poster;
