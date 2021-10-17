const rooms = require('coke-music-data/rooms.json');
const tiles = require('coke-music-data/tiles.json');
const walls = require('coke-music-data/walls.json');

class Settings {
    constructor(game) {
        this.game = game;

        this.container = document.getElementById('coke-music-studio-settings');
        this.closeButton = document.getElementById('coke-music-settings-close');

        this.studioInput = document.getElementById('coke-music-settings-studio-name');

        this.roomTypes = document.getElementById('coke-music-room-types');
        this.floorTypes = document.getElementById('coke-music-floor-types');

        this.saveButton = document.getElementById('coke-music-settings-save');

        this.deleteButton = document.getElementById(
            'coke-music-settings-delete'
        );

        this.settingsButton = document.getElementById(
            'coke-music-toggle-settings'
        );

        this.open = false;
        this.room = null;

        this.boundOnClose = this.onClose.bind(this);
        this.boundOnSave = this.onSave.bind(this);
        this.boundOnDelete = this.onDelete.bind(this);
    }

    onClose() {
        if (this.oldRoomName !== this.room.name) {
            this.changeRoomType(this.oldRoomName);
        }

        this.destroy();
    }

    onSave() {
        const studio = this.studioInput.value.trim();

        if (!studio.length || studio.length > 50) {
            // TODO modal alerts
            alert('Enter name between 1-50 characters.');
            return;
        }

        this.game.write({
            type: 'save-room',
            name: this.room.name,
            studio,
            tile: this.tile,
            wall: this.wall
        });
    }

    onDelete() {
        if (!confirm("Are you sure you want to delete this studio?")) {
            return;
        }

        this.game.write({ type: 'delete-room' });
    }

    clearRooms() {
        this.roomTypes.innerHTML = '';
    }

    changeRoomType(name) {
        this.room.name = name;

        this.room.updateRoomType();
        this.room.drawRoom();
    }

    updateRooms() {
        this.clearRooms();

        for (const [name, room] of Object.entries(rooms)) {
            if (room.public) {
                continue;
            }

            const roomImg = document.createElement('img');

            roomImg.className = 'coke-music-setting-type';

            if (this.room.name === name) {
                roomImg.classList.add('coke-music-setting-type-selected');
            }

            roomImg.src = `/assets/rooms/${name}.png`;

            roomImg.onmousedown = (event) => {
                event.preventDefault();

                if (name === this.room.name) {
                    return;
                }

                this.changeRoomType(name);
                this.updateRooms();
            };

            roomImg.setAttribute('draggable', false);

            this.roomTypes.appendChild(roomImg);
        }
    }

    clearFloors() {
        this.floorTypes.innerHTML = '';
    }

    changeFloorType(tile) {
        this.room.tile = tile;

        this.room.updateTileType();
        this.room.drawRoom();
    }

    updateFloors() {
        this.clearFloors();

        for (const { name, file } of tiles) {
            const floorImg = document.createElement('img');

            floorImg.className = 'coke-music-setting-type';

            if (this.room.tile === file) {
                floorImg.classList.add('coke-music-setting-type-selected');
            }

            floorImg.src = `/assets/tiles/${file}.png`;

            floorImg.onclick = (event) => {
                event.preventDefault();

                let floor = file;

                if (file === this.room.tile) {
                    floor = null;
                }

                this.changeFloorType(floor);
                this.updateFloors();
            };

            this.floorTypes.appendChild(floorImg);
        }
    }

    init() {
        this.open = true;
        this.room = this.game.states.room;

        if (this.game.actionBar.state) {
            this.game.actionBar.state.destroy();
        }

        this.oldRoomName = this.room.name;

        this.updateRooms();
        this.updateFloors();

        this.closeButton.addEventListener('click', this.boundOnClose);
        this.saveButton.addEventListener('click', this.boundOnSave);
        this.deleteButton.addEventListener('click', this.boundOnDelete);

        this.settingsButton.style.fontStyle = 'italic';
        this.container.style.display = 'block';
    }

    destroy() {
        this.open = false;

        this.clearRooms();

        this.closeButton.removeEventListener('click', this.boundOnClose);
        this.saveButton.removeEventListener('click', this.boundOnSave);
        this.deleteButton.removeEventListener('click', this.boundOnDelete);

        this.settingsButton.style.fontStyle = 'normal';
        this.container.style.display = 'none';
    }
}

module.exports = Settings;
