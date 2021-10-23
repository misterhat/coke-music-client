class ObjectSettings {
    constructor(game) {
        this.game = game;

        this.container = document.getElementById('coke-music-object-settings');

        // image on top of pedestal
        this.objectImg = document.getElementById('coke-music-object-image');

        // <h4> with object display name
        this.nameHeader = document.getElementById('coke-music-object-name');

        // buttons
        this.deleteButton = document.getElementById('coke-music-object-delete');
        this.pickUpButton = document.getElementById(
            'coke-music-object-pick-up'
        );
        this.rotateButton = document.getElementById('coke-music-object-rotate');
        this.moveButton = document.getElementById('coke-music-object-move');

        this.room = null;
        this.object = null;

        this.open = false;

        this.boundOnDelete = this.onDelete.bind(this);
        this.boundOnPickUp = this.onPickUp.bind(this);
        this.boundOnRotate = this.onRotate.bind(this);
        this.boundOnMove = this.onMove.bind(this);
    }

    onDelete() {
        this.room.removeObject(this.object);
        this.destroy();

        this.game.write({
            type: 'remove-object',
            name: this.object.name,
            x: this.object.x,
            y: this.object.y
        });
    }

    onPickUp() {
        this.room.removeObject(this.object);
        this.destroy();

        this.game.write({
            type: 'pick-up-object',
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
                type: 'rotate-object',
                name: this.object.name,
                x: this.object.x,
                y: this.object.y
            });
        }
    }

    onMove() {}

    init({ object }) {
        this.object = object;

        this.room = this.game.states.room;

        this.nameHeader.textContent = object.title;
        this.objectImg.src = `/assets/furniture/icons/${this.object.name}.png`;
        this.objectImg.style.bottom = `${this.objectImg.height - 20}px`;

        this.deleteButton.addEventListener('click', this.boundOnDelete);
        this.pickUpButton.addEventListener('click', this.boundOnPickUp);
        this.rotateButton.addEventListener('click', this.boundOnRotate);
        this.moveButton.addEventListener('click', this.boundOnMove);

        this.container.style.display = 'block';
    }

    destroy() {
        this.container.style.display = 'none';

        this.deleteButton.removeEventListener('click', this.boundOnDelete);
        this.pickUpButton.removeEventListener('click', this.boundOnPickUp);
        this.rotateButton.removeEventListener('click', this.boundOnRotate);
        this.moveButton.removeEventListener('click', this.boundOnMove);
    }
}

module.exports = ObjectSettings;
