class ObjectSettings {
    constructor(game, type = 'object') {
        this.game = game;
        this.type = type;

        this.container = document.getElementById(
            `coke-music-${this.type}-settings`
        );

        // image on top of pedestal
        this.pedestalImg = document.getElementById(
            `coke-music-${this.type}-image`
        );

        // <h4> with object display name
        this.nameHeader = document.getElementById(
            `coke-music-${this.type}-name`
        );

        // buttons
        this.deleteButton = document.getElementById(
            `coke-music-${this.type}-delete`
        );

        this.pickUpButton = document.getElementById(
            `coke-music-${this.type}-pick-up`
        );

        if (this.type === 'object') {
            this.rotateButton = document.getElementById(
                `coke-music-${this.type}-rotate`
            );
        }

        this.moveButton = document.getElementById(
            `coke-music-${this.type}-move`
        );

        this.room = null;
        this.object = null;

        this.open = false;

        this.boundOnDelete = this.onDelete.bind(this);
        this.boundOnPickUp = this.onPickUp.bind(this);
        this.boundOnRotate = this.onRotate.bind(this);
        this.boundOnMove = this.onMove.bind(this);
        this.boundOnEscape = this.onEscape.bind(this);
    }

    onDelete() {
        this.room.removeObject(this.object);
        this.destroy();

        this.game.write({
            type: `remove-${this.type}`,
            name: this.object.name,
            x: this.object.x,
            y: this.object.y
        });
    }

    onPickUp() {
        this.room.removeObject(this.object);
        this.destroy();

        this.game.write({
            type: `pick-up-${this.type}`,
            name: this.object.name,
            x: this.object.x,
            y: this.object.y
        });
    }

    onRotate() {
        const oldAngle = this.object.angle;

        this.object.rotate();

        if (this.object.isBlocked()) {
            this.object.angle = oldAngle;
        } else {
            const newAngle = this.object.angle;

            this.object.angle = oldAngle;
            this.room.removeObject(this.object);

            this.object.angle = newAngle;

            this.room.addObject(this.object);

            this.game.write({
                type: `rotate-${this.type}`,
                name: this.object.name,
                x: this.object.x,
                y: this.object.y
            });
        }
    }

    onMove() {
        this.object.oldX = this.object.x;
        this.object.oldY = this.object.y;
        this.room.removeObject(this.object);
        this.room.moveObject(this.object);
    }

    onEscape(event) {
        if (event.key === 'Escape') {
            this.destroy();
        }
    }

    init({ object }) {
        this.room = this.game.states.room;

        if (this.room.ownerID !== this.game.characterID) {
            return;
        }

        this.object = object;

        this.nameHeader.textContent = object.title;

        this.pedestalImg.src = `/assets/furniture/icons/${this.object.name}.png`;
        this.pedestalImg.style.bottom = `${this.pedestalImg.height - 20}px`;

        this.deleteButton.addEventListener('click', this.boundOnDelete);
        this.pickUpButton.addEventListener('click', this.boundOnPickUp);

        if (this.rotateButton) {
            this.rotateButton.addEventListener('click', this.boundOnRotate);
        }

        this.moveButton.addEventListener('click', this.boundOnMove);
        window.addEventListener('keyup', this.boundOnEscape);

        this.container.style.display = 'block';
    }

    destroy() {
        this.container.style.display = 'none';

        this.deleteButton.removeEventListener('click', this.boundOnDelete);
        this.pickUpButton.removeEventListener('click', this.boundOnPickUp);

        if (this.rotateButton) {
            this.rotateButton.removeEventListener('click', this.boundOnRotate);
        }

        this.moveButton.removeEventListener('click', this.boundOnMove);
        window.removeEventListener('keyup', this.boundOnEscape);
    }
}

module.exports = ObjectSettings;
