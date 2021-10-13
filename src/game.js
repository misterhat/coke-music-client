const Entry = require('./entry');
const Login = require('./login');
const Room = require('./room');
const { EventEmitter } = require('events');

const WIDTH = 800;
const HEIGHT = 600;

const PRELOAD_IMAGES = [
    '/entry.png',

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
    '/character/bodies.png',
    '/character/arms.png',

    '/message_name.png'
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

class Game extends EventEmitter {
    constructor(container, { server, port, ssl } = {}) {
        super();

        this.container = container;

        this.server = server || 'localhost';
        this.port = port || 43594;
        this.ssl = !!ssl;

        this.canvas = document.createElement('canvas');

        this.canvas.width = WIDTH;
        this.canvas.height = HEIGHT;

        this.context = this.canvas.getContext('2d');

        // { preloaded imaged name: Image }
        this.images = {};

        this.mouseX = 0;
        this.mouseY = 0;
        this.mouseDown = false;

        this.loadingDiv = document.getElementById('coke-music-loading');

        this.addEventListeners();

        this.states = {
            login: new Login(this),
            room: new Room(this),
            entry: new Entry(this)
        };

        this.socket = null;

        this.frameMs = 1000 / 15;

        this.boundDraw = this.draw.bind(this);
        this.boundUpdate = this.update.bind(this);
    }

    addEventListeners() {
        this.container.addEventListener('mousemove', (event) => {
            const { x, y } = getMousePosition(this.canvas, event);

            this.mouseX = x;
            this.mouseY = y;
        });

        this.container.addEventListener('mousedown', (event) => {
            this.mouseDown = true;
        });

        window.addEventListener('mouseup', () => {
            this.mouseDown = false;
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

    // connect to the websockets
    connect() {
        return new Promise((resolve, reject) => {
            const socket = new WebSocket(
                `ws${this.ssl ? 's' : ''}://${this.server}:${this.port}`
            );

            const onOpen = () => {
                this.socket = socket;

                socket.addEventListener('message', ({ data }) => {
                    try {
                        data = JSON.parse(data);
                    } catch (e) {
                        console.error(`malformed json ${data}`);
                    }

                    this.emit('message', data);
                });

                socket.addEventListener('close', () => {
                    this.changeState('login');
                    this.state.showError('Server disconnected.');
                });

                resolve();
                socket.removeEventListener('open', open);
            };

            const onError = (err) => {
                reject(err);
                socket.removeEventListener('error', onError);
                socket.removeEventListener('open', onOpen);
            };

            socket.addEventListener('error', (err) => {
                console.error(err);
            });

            socket.addEventListener('error', onError);
            socket.addEventListener('open', onOpen);
        });
    }

    // write to socket
    write(message) {
        this.socket.send(JSON.stringify(message));
    }

    changeState(newState, properties) {
        if (this.state) {
            this.state.destroy();
        }

        this.state = this.states[newState];
        this.state.init(properties);
    }

    async start() {
        await this.load();

        this.loadingDiv.style.display = 'none';

        this.container.appendChild(this.canvas);

        this.changeState('login');

        this.update();
        this.draw();
    }

    update() {
        this.state.update();
        setTimeout(this.boundUpdate, Math.floor(this.frameMs));
    }

    draw() {
        this.context.fillStyle = '#000';
        this.context.fillRect(0, 0, WIDTH, HEIGHT);

        this.state.draw();

        window.requestAnimationFrame(this.boundDraw);
    }
}

module.exports = Game;
