const rooms = require('./rooms.json');

const WIDTH = 800;
const HEIGHT = 600;

const TILE_WIDTH = 70;
const TILE_HEIGHT = 36;

const PRELOAD_IMAGES = [
    // TODO we can automatically populate this based on room.json data
    '/rooms/studio_a.png',
    '/rooms/studio_b.png',
    '/rooms/studio_c.png',
    '/rooms/studio_d.png',

    '/tiles/selected.png',

    '/character_test.png',

    '/walls/wall_a_left.png',
    '/walls/wall_a_right.png',

    '/tiles/purple_carpet.png',
    '/tiles/brown_carpet.png'
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

// apply background shading to an image
function getShaded(image, backgroundImage, offsetX, offsetY, intensity = 0.75) {
    const imageCanvas = document.createElement('canvas');
    imageCanvas.width = image.width;
    imageCanvas.height = image.height;

    const imageContext = imageCanvas.getContext('2d');
    imageContext.drawImage(image, 0, 0);

    const imageData = imageContext.getImageData(0, 0, image.width, image.height)
        .data;

    const shaded = document.createElement('canvas');

    shaded.width = image.width;
    shaded.height = image.height;

    const shadedContext = shaded.getContext('2d');

    shadedContext.drawImage(
        backgroundImage,
        offsetX,
        offsetY,
        image.width,
        image.height,
        0,
        0,
        image.width,
        image.height
    );

    const shadedData = shadedContext.getImageData(
        0,
        0,
        image.width,
        image.height
    );

    for (let i = 0; i < image.width * image.height * 4; i += 4) {
        if (imageData[i + 3] === 0) {
            shadedData.data[i + 3] = 0;
        }
    }

    shadedContext.putImageData(shadedData, 0, 0);

    imageContext.globalCompositeOperation = 'overlay';
    imageContext.globalAlpha = intensity;
    imageContext.drawImage(shaded, 0, 0);
    imageContext.globalAlpha = 1;

    return {
        context: imageContext,
        canvas: imageCanvas
    };
}

class Room {
    constructor(game, { name, wallType, tileType }) {
        this.game = game;
        this.name = name;

        Object.assign(this, rooms[this.name]);
        // TODO get width/height from map instead

        this.objects = [];
        this.wallObjects = [];
        this.characters = [];

        // the base background image without any custom walls or tiles applied
        this.backgroundImage = this.game.images[`/rooms/${name}.png`];

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

        this.tileImage = this.game.images['/tiles/brown_carpet.png'];

        // the yellow tile-select image
        this.tileSelectImage = this.game.images['/tiles/selected.png'];

        // cartesian coordinates of where to draw tileSelectImage
        this.tileSelectX = -1;
        this.tileSelectY = -1;
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

    // convert isometric grid position to cartesian coordinate
    isoToCoordinate(isoX, isoY) {
        const x =
            (isoX - isoY) * TILE_HEIGHT + this.offsetX + this.backgroundOffsetX;

        const y =
            (isoX + isoY) * (TILE_HEIGHT / 2) +
            this.offsetY +
            this.backgroundOffsetY;

        return { x, y };
    }

    drawTiles() {
        for (let isoY = 0; isoY < this.height; isoY += 1) {
            for (let isoX = 0; isoX < this.width; isoX += 1) {
                if (this.map[isoY][isoX]) {
                    continue;
                }

                let { x, y } = this.isoToCoordinate(isoX, isoY);
                x -= this.backgroundOffsetX;
                y -= this.backgroundOffsetY;

                let drawWidth = TILE_WIDTH;

                if (this.exit.x === isoX && this.exit.y === isoY) {
                    drawWidth = drawWidth / 2;
                }

                const { canvas } = getShaded(
                    this.tileImage,
                    this.backgroundImage,
                    x,
                    y,
                    0.5
                );

                this.roomContext.drawImage(
                    canvas,
                    0,
                    0,
                    drawWidth,
                    TILE_HEIGHT,
                    x,
                    y,
                    drawWidth,
                    TILE_HEIGHT
                );
            }
        }
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
                const { context, canvas } = getShaded(
                    image,
                    this.backgroundImage,
                    drawX,
                    drawY,
                    0.75
                );

                const isExit =
                    +wallIndex === this.exit.wall[0] && i === this.exit.wall[1];

                if (isExit) {
                    cutPolygon(context, this.exit.clip);
                }

                this.roomContext.drawImage(canvas, drawX, drawY);

                drawY += deltaY;
                drawX += TILE_HEIGHT;
            }
        }
    }

    drawRoom() {
        this.roomContext.drawImage(this.backgroundImage, 0, 0);
        this.drawTiles();
        this.drawWalls();
    }

    init() {
        const character = new Character(this.game, this, {});
        this.characters.push(character);

        this.drawRoom();
    }

    // are we selecting a tile with the mouse?
    isTileSelected() {
        return this.tileSelectX !== -1 && this.tileSelectY !== -1;
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

        this.state = new Room(this, { name: 'studio_d' });

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
