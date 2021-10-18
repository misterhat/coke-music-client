const GameObject = require('./game-object');
const furniture = require('coke-music-data/furniture.json');

class Inventory {
    constructor(game) {
        this.game = game;

        this.container = document.getElementById('coke-music-inventory');
        this.header = document.getElementById('coke-music-inventory-header');
        this.close = document.getElementById('coke-music-inventory-close');

        this.itemContainer = document.getElementById(
            'coke-music-inventory-items'
        );

        // absolute position of container
        this.x = 500;
        this.y = 184;

        // offset when clicked with mouse
        this.offsetX = 0;
        this.offsetY = 0;

        this.open = false;
        this.dragging = false;

        // [ { type, name } ]
        this.items = [
            { type: 'furniture', name: 'northern_minibar' },
            { type: 'furniture', name: 'coke_couch' }
        ];

        this.boundOnMouseDown = this.onMouseDown.bind(this);
        this.boundClose = this.onClose.bind(this);
    }

    onMouseDown() {
        this.offsetX = this.game.mouseX - this.x;
        this.offsetY = this.game.mouseY - this.y;

        this.dragging = true;
    }

    onClose() {
        this.destroy();
    }

    clearInventory() {
        this.itemContainer.innerHTML = '';
    }

    updateInventory() {
        this.clearInventory();

        for (const [index, item] of this.items.entries()) {
            const itemDiv = document.createElement('div');

            itemDiv.className = 'coke-music-inventory-item';
            itemDiv.style.backgroundImage = `url(/assets/furniture/icons/${item.name}.png)`;
            itemDiv.title = furniture[item.name].title;

            itemDiv.onmousedown = (event) => {
                event.preventDefault();

                const { room } = this.game.states;

                const object = new GameObject(
                    this.game,
                    room,
                    this.items[index]
                );

                object.edit = true;

                room.activeObject = object;

                this.game.mouseDown = false;
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
    }

    update() {
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
        this.header.addEventListener('mousedown', this.boundOnMouseDown);
        this.close.addEventListener('click', this.boundClose);

        this.container.style.left = `${this.x}px`;
        this.container.style.top = `${this.y}px`;

        this.open = true;
        this.dragging = false;

        this.updateInventory();

        this.container.style.display = 'block';
    }

    destroy() {
        this.header.removeEventListener('mousedown', this.boundOnMouseDown);
        this.close.removeEventListener('click', this.boundClose);

        this.open = false;

        this.game.actionBar.toggleSelected('inventory', false);

        this.container.style.display = 'none';

        this.clearInventory();
    }
}

module.exports = Inventory;
