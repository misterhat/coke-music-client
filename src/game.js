const ActionBar = require('./action-bar');
const Appearance = require('./appearance');
const Chat = require('./chat');
const Entry = require('./entry');
const Inventory = require('./inventory');
const Login = require('./login');
const Navigation = require('./navigation');
const ObjectSettings = require('./object-settings');
const Register = require('./register');
const Room = require('./room');
const Settings = require('./settings');
const furniture = require('coke-music-data/furniture.json');
const rooms = require('coke-music-data/rooms.json');
const rugs = require('coke-music-data/rugs.json');
const tiles = require('coke-music-data/tiles.json');
const walls = require('coke-music-data/walls.json');
const { EventEmitter } = require('events');

const WIDTH = 800;
const HEIGHT = 600;

const PRELOAD_IMAGES = [
    '/entry.png',

    '/tiles/selected.png',

    '/character/heads.png',
    '/character/faces.png',
    '/character/eyes.png',
    '/character/hair.png',
    '/character/hats.png',
    '/character/bodies.png',
    '/character/arms.png',
    '/character/shirts.png',
    '/character/sleeves.png',
    '/character/pants.png',
    '/character/shoes.png',
    '/character/shadow.png',

    '/message_name.png'
];

PRELOAD_IMAGES.push(...Object.keys(rooms).map((name) => `/rooms/${name}.png`));

PRELOAD_IMAGES.push(...tiles.map(({ file }) => `/tiles/${file}.png`));

for (const { file } of walls) {
    PRELOAD_IMAGES.push(`/walls/${file}_left.png`);
    PRELOAD_IMAGES.push(`/walls/${file}_right.png`);
}

const furnitureImages = Object.keys(furniture);
furnitureImages.push(...Object.keys(rugs));

PRELOAD_IMAGES.push(...furnitureImages.map((name) => `/furniture/${name}.png`));

// TODO filter by sit
PRELOAD_IMAGES.push('/furniture/coke_couch_foreground.png');
PRELOAD_IMAGES.push('/furniture/grunge_couch_foreground.png');
PRELOAD_IMAGES.push('/furniture/cow_bean_bag_foreground.png');

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

        this.loadingDiv = document.getElementById('coke-music-loading');

        this.canvas = document.createElement('canvas');

        this.canvas.width = WIDTH;
        this.canvas.height = HEIGHT;

        this.context = this.canvas.getContext('2d');

        // { preloaded imaged name: Image }
        this.images = {};

        this.mouseX = 0;
        this.mouseY = 0;
        this.mouseDown = false;

        this.addEventListeners();

        this.states = {
            login: new Login(this),
            register: new Register(this),
            entry: new Entry(this),
            room: new Room(this)
        };

        // substates
        this.navigation = new Navigation(this);
        this.chat = new Chat(this);
        this.inventory = new Inventory(this);
        this.actionBar = new ActionBar(this);
        this.settings = new Settings(this);
        this.objectSettings = new ObjectSettings(this, 'object');
        this.rugSettings = new ObjectSettings(this, 'rug');
        this.appearance = new Appearance(this);

        this.socket = null;

        this.characterID = null;

        // milliseconds per frame
        this.frameMs = Math.floor(1000 / 30);

        this.boundDraw = this.draw.bind(this);
        this.boundUpdate = this.update.bind(this);
    }

    isPanelOpen() {
        return (
            this.navigation.open ||
            this.inventory.open ||
            this.settings.open ||
            this.appearance.open
        );
    }

    addEventListeners() {
        this.on('message', (message) => {
            switch (message.type) {
                case 'join-room':
                    this.changeState('room', message);
                    break;
                case 'leave-room':
                    this.changeState('navigation', { isEntry: true });
                    break;
                case 'inventory':
                    this.inventory.items = message.items;

                    if (this.inventory.open) {
                        this.inventory.updateInventory();
                    }
                    break;
                case 'appearance':
                    this.appearance.init();
                    break;
            }
        });

        window.addEventListener('mousemove', (event) => {
            const { x, y } = getMousePosition(this.canvas, event);

            this.mouseX = Math.min(WIDTH, Math.max(0, x));
            this.mouseY = Math.min(HEIGHT, Math.max(0, y));
        });

        this.container.addEventListener('mousedown', (event) => {
            if (event.button === 0) {
                this.mouseDown = true;
            }
        });

        window.addEventListener('mouseup', () => {
            this.mouseDown = false;
        });

        this.container.addEventListener('contextmenu', (event) => {
            event.preventDefault();
        });
    }

    // preload image and JSON assets
    load() {
        return new Promise((resolve, reject) => {
            let loaded = 0;

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
        const startTime = Date.now();

        if (this.inventory.open) {
            this.inventory.update();
        }

        this.state.update();

        const deltaTime = Date.now() - startTime;

        setTimeout(this.boundUpdate, this.frameMs - deltaTime);
    }

    draw() {
        this.context.fillStyle = '#000';
        this.context.fillRect(0, 0, WIDTH, HEIGHT);

        this.state.draw();

        window.requestAnimationFrame(this.boundDraw);
    }
}

module.exports = Game;
