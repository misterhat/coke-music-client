class Inventory {
    constructor(game) {
        this.game = game;

        this.container = document.getElementById('coke-music-inventory');
        this.header = document.getElementById('coke-music-inventory-header');
        this.close = document.getElementById('coke-music-inventory-close');

        this.x = 500;
        this.y = 184;

        this.offsetX = 0;
        this.offsetY = 0;

        this.open = false;
        this.dragging = false;

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

        this.container.style.display = 'block';
    }

    destroy() {
        this.header.removeEventListener('mousedown', this.boundOnMouseDown);
        this.close.removeEventListener('click', this.boundClose);

        this.open = false;

        this.game.actionBar.toggleSelected('inventory', false);

        this.container.style.display = 'none';
    }
}

module.exports = Inventory;
