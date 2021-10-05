const rooms = require('./rooms.json');

const WIDTH = 800;
const HEIGHT = 600;

const TILE_WIDTH = 70;
const TILE_HEIGHT = 36;

const PRELOAD_IMAGES = [
    '/rooms/studio_a.png',
    '/selected_tile.png',
    '/character_test.png',
    '/walls/wall_a_left.png',
    '/walls/wall_a_right.png'
];

function getMousePosition(canvas, e) {
    const boundingRect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / boundingRect.width;
    const scaleY = canvas.height / boundingRect.height;

    return {
        x: Math.floor((e.clientX - boundingRect.left) * scaleX),
        y: Math.floor((e.clientY - boundingRect.top) * scaleY)
    };
}

const CHARACTER_HEIGHT = 102;

class Character {
    constructor(game, room, appearance) {
        this.game = game;
        this.room = room;

        // isometric position
        this.x = 5;
        this.y = 10;

        this.drawX = 0;
        this.drawY = 0;

        this.image = this.game.images['/character_test.png'];
    }

    update() {
        const { x, y } = this.room.isoToCoordinate(this.x, this.y);

        this.drawX = x;
        this.drawY = y - CHARACTER_HEIGHT + TILE_HEIGHT - 8;
    }

    draw() {
        const { context } = this.game;
        context.drawImage(this.image, this.drawX, this.drawY);
    }
}

// set a polygon of an image to transparent
function cutPolygon(context, points) {
    console.log(points);

    const path = new Path2D();
    path.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length; i += 1) {
        const { x, y } = points[i];
        path.lineTo(x, y);
    }

    path.closePath();

    context.globalCompositeOperation = 'destination-out';

    context.fill(path);

    context.globalCompositeOperation = 'source-over';
}

class Room {
    constructor(game, { name, wallType, tileType }) {
        this.game = game;
        this.name = name;

        Object.assign(this, rooms[this.name]);

        this.objects = [];
        this.wallObjects = [];
        this.characters = [];

        // the base background image without any custom walls or tiles applied
        this.backgroundImage = this.game.images['/rooms/studio_a.png'];

        // a buffered image of the background with walls and tiles applied
        this.roomImage = document.createElement('canvas');

        this.roomImage.width = this.backgroundImage.width;
        this.roomImage.height = this.backgroundImage.width;

        this.roomContext = this.roomImage.getContext('2d');

        // unshaded wall sprites
        this.wallLeftImage = this.game.images['/walls/wall_a_left.png'];
        this.wallRightImage = this.game.images['/walls/wall_a_right.png'];

        // offsets used to centre the room image
        this.backgroundOffsetX = Math.floor(
            WIDTH / 2 - this.backgroundImage.width / 2
        );

        this.backgroundOffsetY = Math.floor(
            HEIGHT / 2 - this.backgroundImage.height / 2
        );

        // the yellow tile-select image
        this.tileSelectImage = this.game.images['/selected_tile.png'];

        // cartesian coordinates of where to draw tileSelectImage
        this.tileSelectX = -1;
        this.tileSelectY = -1;
    }

    drawTiles() {
    }

    drawWalls() {
        for (const [wallIndex, wallSection] of Object.entries(this.walls)) {
            const image =
                wallSection.orientation === 'left'
                    ? this.wallLeftImage
                    : this.wallRightImage;

            const deltaY = 18 * (wallSection.orientation === 'left' ? -1 : 1);

            let drawX = wallSection.offsetX;
            let drawY = wallSection.offsetY;

            for (let i = 0; i < wallSection.width; i += 1) {
                const wallCanvas = document.createElement('canvas');
                const wallContext = wallCanvas.getContext('2d');

                wallContext.drawImage(image, 0, 0);

                const wallImageData = wallContext.getImageData(
                    0,
                    0,
                    image.width,
                    image.height
                ).data;

                const shaded = document.createElement('canvas');

                shaded.width = image.width;
                shaded.height = image.height;

                const ctx = shaded.getContext('2d');

                ctx.drawImage(
                    this.backgroundImage,
                    drawX,
                    drawY,
                    image.width,
                    image.height,
                    0,
                    0,
                    image.width,
                    image.height
                );

                const imageData = ctx.getImageData(
                    0,
                    0,
                    image.width,
                    image.height
                );

                for (let i = 0; i < image.width * image.height * 4; i += 4) {
                    if (
                        //imageData.data[i] === 0 ||
                        wallImageData[i + 3] === 0 /*||
                        !(
                            imageData.data[i] === imageData.data[i + 1] &&
                            imageData.data[i] === imageData.data[i + 2] &&
                            imageData.data[i + 1] === imageData.data[i + 2]
                        )*/
                    ) {
                        imageData.data[i + 3] = 0;
                    }
                }

                ctx.putImageData(imageData, 0, 0);

                document.body.appendChild(shaded);

                const isExit = +wallIndex === this.exit.wall[0] && i === this.exit.wall[1];

                if (isExit) {
                    cutPolygon(wallContext, this.exit.clip);
                    document.body.appendChild(wallCanvas);
                }

                this.roomContext.drawImage(wallCanvas, drawX, drawY);

                if (!isExit) {
                    // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation
                    // darken, overlay, luminosity
                    this.roomContext.globalCompositeOperation = 'overlay';
                    this.roomContext.globalAlpha = 0.75;

                    this.roomContext.drawImage(shaded, drawX, drawY);

                    this.roomContext.globalCompositeOperation = 'source-over';
                    this.roomContext.globalAlpha = 1;
                }

                drawY += deltaY;
                drawX += TILE_HEIGHT;
            }
        }
    }

    drawRoom() {
        this.roomContext.drawImage(this.backgroundImage, 0, 0);
        this.drawWalls();
    }

    init() {
        const character = new Character(this.game, this, {});
        this.characters.push(character);

        this.drawRoom();
    }

    // convert cartesian coordinates to isometric grid position
    coordinateToIso(x, y) {
        x -= this.backgroundOffsetX + this.offsetX;
        y -= this.backgroundOffsetY + this.offsetY;

        const isoX = Math.floor(
            (y - TILE_HEIGHT / 2) / TILE_HEIGHT + x / TILE_WIDTH
        );

        const isoY = Math.floor(
            (y + TILE_HEIGHT / 2) / TILE_HEIGHT - x / TILE_WIDTH
        );

        return { isoX, isoY };
    }

    // convert iso metric grid position to cartesian coordinate
    isoToCoordinate(isoX, isoY) {
        const x =
            (isoX - isoY) * (TILE_WIDTH / 2) +
            this.offsetX +
            this.backgroundOffsetX;

        const y =
            (isoX + isoY) * (TILE_HEIGHT / 2) +
            this.offsetY +
            this.backgroundOffsetY;

        return { x, y };
    }

    // are we selecting a tile with the mouse?
    isTileSelected() {
        if (this.tileSelectX !== -1 && this.tileSelectY !== -1) {
            return true;
        }

        return false;
    }

    update() {
        for (const character of this.characters) {
            character.update();
        }

        const { mouseX, mouseY } = this.game;
        const { isoX, isoY } = this.coordinateToIso(mouseX, mouseY);

        // make sure the coordinate isn't off the grid or blocked
        if (
            isoX < 0 ||
            isoY < 0 ||
            isoX >= this.width ||
            isoY >= this.height ||
            this.map[isoY][isoX]
        ) {
            this.tileSelectX = -1;
            this.tileSelectY = -1;
            return;
        }

        const { x: tileX, y: tileY } = this.isoToCoordinate(isoX, isoY);

        this.tileSelectX = tileX;
        this.tileSelectY = tileY;
    }

    draw() {
        const { context } = this.game;

        context.drawImage(
            this.roomImage,
            this.backgroundOffsetX,
            this.backgroundOffsetY
        );

        if (this.isTileSelected()) {
            context.drawImage(
                this.tileSelectImage,
                this.tileSelectX,
                this.tileSelectY
            );
        }

        for (const character of this.characters) {
            character.draw();
        }

        /*
        context.fillText(`mouseX: ${this.mouseX}`, 100, 70);
        context.fillText(`mouseY: ${this.mouseY}`, 100, 85);
        context.fillText(`isoX: ${this.isoX}`, 100, 100);
        context.fillText(`isoY: ${this.isoY}`, 100, 115);

        context.fillText(`tileX: ${this.tileX}`, 100, 125);
        context.fillText(`tileY: ${this.tileY}`, 100, 135);
        context.fillRect(this.tileX, this.tileY, TILE_WIDTH, TILE_HEIGHT);*/
    }

    destroy() {}
}

class CokeMusic {
    constructor(container) {
        this.container = container;

        this.canvas = document.createElement('canvas');
        this.canvas.width = WIDTH;
        this.canvas.height = HEIGHT;

        this.context = this.canvas.getContext('2d');

        this.images = {};

        this.mouseX = 0;
        this.mouseY = 0;
        this.mouseDown = false;

        this.addEventListeners();

        this.boundDraw = this.draw.bind(this);
        this.boundUpdate = this.update.bind(this);
    }

    addEventListeners() {
        this.canvas.addEventListener('mousemove', (event) => {
            const { x, y } = getMousePosition(this.canvas, event);

            this.mouseX = x;
            this.mouseY = y;
        });
    }

    // preload image and JSON assets
    load() {
        let loaded = 0;

        return new Promise((resolve, reject) => {
            for (const image of PRELOAD_IMAGES) {
                const img = new Image();
                this.images[image] = img;

                img.onerror = () => {
                    reject(new Error(`unable to load image: ${image}`));
                };

                img.onload = () => {
                    loaded += 1;

                    if (loaded === PRELOAD_IMAGES.length) {
                        resolve();
                    }
                };

                img.src = `/assets/${image}`;
            }
        });
    }

    start() {
        this.container.appendChild(this.canvas);

        this.state = new Room(this, { name: 'studio_a' });

        this.state.init();

        this.update();
        this.draw();
    }

    update() {
        this.state.update();
        setTimeout(this.boundUpdate, 30);
    }

    draw() {
        this.context.fillStyle = '#000';
        this.context.fillRect(0, 0, WIDTH, HEIGHT);

        this.state.draw();

        window.requestAnimationFrame(this.boundDraw);
    }
}

(async () => {
    const game = new CokeMusic(document.getElementById('coke-music-container'));
    await game.load();
    game.start();
})();
