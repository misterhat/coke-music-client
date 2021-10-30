const GameObject = require('../entities/game-object');
const Poster = require('../entities/poster');
const Rug = require('../entities/rug');
const furniture = require('coke-music-data/furniture.json');
const posters = require('coke-music-data/posters.json');
const rugs = require('coke-music-data/rugs.json');

// max items per page
const ITEMS_PER_PAGE = 25;

const TRANSITION_MS = 500;

class Inventory {
    constructor(game) {
        this.game = game;

        this.container = document.getElementById('coke-music-inventory');
        this.header = document.getElementById('coke-music-inventory-header');

        this.closeButton = document.getElementById(
            'coke-music-inventory-close'
        );

        this.itemContainer = document.getElementById(
            'coke-music-inventory-items'
        );

        this.previousButton = document.getElementById(
            'coke-music-inventory-previous'
        );

        this.nextButton = document.getElementById('coke-music-inventory-next');

        this.currentPageSpan = document.getElementById(
            'coke-music-inventory-current'
        );

        this.totalPageSpan = document.getElementById(
            'coke-music-inventory-total'
        );

        // absolute position of container
        this.x = 500;
        this.y = 184;

        this.lastY = this.y;

        // offset when clicked with mouse
        this.offsetX = 0;
        this.offsetY = 0;

        this.open = false;
        this.dragging = false;

        // [ { type, name } ]
        this.items = [];

        this.page = 0;

        this.transformTimeout = null;

        this.boundOnMouseDown = this.onMouseDown.bind(this);
        this.boundOnClose = this.onClose.bind(this);
        this.boundOnNext = this.onNext.bind(this);
        this.boundOnPrevious = this.onPrevious.bind(this);
    }

    getTotalPages() {
        return Math.max(1, Math.ceil(this.items.length / ITEMS_PER_PAGE));
    }

    onMouseDown() {
        this.offsetX = this.game.mouseX - this.x;
        this.offsetY = this.game.mouseY - this.y;

        this.dragging = true;
    }

    onClose() {
        this.destroy();
    }

    onPrevious() {
        if (this.page === 0) {
            return;
        }

        this.page -= 1;

        this.updateInventory();
    }

    onNext() {
        if (this.page + 1 === this.getTotalPages()) {
            return;
        }

        this.page += 1;

        this.updateInventory();
    }

    clearInventory() {
        this.itemContainer.innerHTML = '';
    }

    updateInventory() {
        this.clearInventory();

        if (this.page >= this.getTotalPages()) {
            this.page = 0;
        }

        for (const item of this.items.slice(
            this.page * ITEMS_PER_PAGE,
            (this.page + 1) * ITEMS_PER_PAGE
        )) {
            const itemDiv = document.createElement('div');

            itemDiv.className = 'coke-music-inventory-item';
            itemDiv.style.backgroundImage = `url(/assets/furniture/icons/${item.name}.png)`;

            if (item.type === 'furniture') {
                itemDiv.title = furniture[item.name].title;
            } else if (item.type === 'rugs') {
                itemDiv.title = rugs[item.name].title;
            }

            itemDiv.onmousedown = (event) => {
                event.preventDefault();

                this.game.mouseDown = false;

                const { room } = this.game.states;

                if (room.ownerID !== this.game.characterID) {
                    return;
                }

                if (item.type === 'furniture') {
                    const object = new GameObject(this.game, room, item);
                    room.moveObject(object);
                } else if (item.type === 'rugs') {
                    const rug = new Rug(this.game, room, item);
                    room.moveObject(rug);
                } else if (item.type === 'posters') {
                    const poster = new Poster(this.game, room, item);
                    room.movePoster(poster);
                }
            };

            itemDiv.onmouseup = () => {
                this.game.mouseDown = false;
                this.destroy();
            };

            itemDiv.setAttribute('draggable', false);

            this.itemContainer.appendChild(itemDiv);
        }

        const clearDiv = document.createElement('div');

        clearDiv.style.clear = 'both';
        this.itemContainer.appendChild(clearDiv);

        this.currentPageSpan.textContent = this.page + 1;
        this.totalPageSpan.textContent = this.getTotalPages();
    }

    update() {
        if (this.transformTimeout) {
            return;
        }

        if (!this.game.mouseDown) {
            this.dragging = false;
            return;
        }

        if (this.dragging) {
            this.x = Math.max(
                0,
                Math.min(800 - 238, this.game.mouseX - this.offsetX)
            );

            this.y = Math.max(
                44,
                Math.min(800 - 336, this.game.mouseY - this.offsetY)
            );

            this.container.style.left = `${this.x}px`;
            this.container.style.top = `${this.y}px`;
        }
    }

    init() {
        this.open = true;
        this.dragging = false;

        this.header.addEventListener('mousedown', this.boundOnMouseDown);
        this.closeButton.addEventListener('click', this.boundOnClose);
        this.nextButton.addEventListener('click', this.boundOnNext);
        this.previousButton.addEventListener('click', this.boundOnPrevious);

        this.container.style.transition = `top ${TRANSITION_MS / 1000}s`;
        this.container.style.left = `${this.x}px`;
        this.container.style.top = `${this.y}px`;

        clearTimeout(this.transformTimeout);

        this.transformTimeout = setTimeout(() => {
            this.container.style.transition = '';
            this.transformTimeout = null;
        }, TRANSITION_MS);

        this.updateInventory();

        //this.container.style.display = 'block';
    }

    destroy() {
        this.open = false;

        this.container.style.transition = `top ${TRANSITION_MS / 1000}s`;
        this.container.style.top = '800px';

        clearTimeout(this.transformTimeout);

        this.transformTimeout = setTimeout(() => {
            this.container.style.transition = '';
            this.transformTimeout = null;
        }, TRANSITION_MS);

        this.header.removeEventListener('mousedown', this.boundOnMouseDown);
        this.closeButton.removeEventListener('click', this.boundOnClose);
        this.nextButton.removeEventListener('click', this.boundOnNext);
        this.previousButton.removeEventListener('click', this.boundOnPrevious);

        this.game.actionBar.toggleSelected('inventory', false);

        //this.container.style.display = 'none';

        this.clearInventory();
    }
}

module.exports = Inventory;
