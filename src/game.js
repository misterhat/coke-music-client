const Room = require('./room');

const WIDTH = 800;
const HEIGHT = 600;

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
    '/tiles/brown_carpet.png',

    '/character/heads.png',
    '/character/faces.png',
    '/character/eyes.png',
    '/character/hair.png',
    '/character/hats.png',
    '/character/bodies.png'
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

class Game {
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

        this.state = new Room(this, { name: 'studio_c' });

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

module.exports = Game;
