const rooms = require('coke-music-data/rooms.json');

class Settings {
    constructor(game) {
        this.game = game;

        this.container = document.getElementById('coke-music-studio-settings');

        this.closeButton = document.getElementById('coke-music-settings-close');

        this.roomTypes = document.getElementById('coke-music-room-types');

        this.settingsButton = document.getElementById(
            'coke-music-toggle-settings'
        );

        this.open = false;
        this.room = null;

        this.selectedRoomImg = null;

        this.boundOnClose = this.onClose.bind(this);
    }

    onClose() {
        this.destroy();
    }

    clearRooms() {
        this.roomTypes.innerHTML = '';
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
                this.selectedRoomImg = roomImg;
            }

            roomImg.src = `/assets/rooms/${name}.png`;

            roomImg.onmousedown = (event) => {
                event.preventDefault();

                alert('test');
            };

            roomImg.setAttribute('draggable', false);

            this.roomTypes.appendChild(roomImg);
        }
    }

    init() {
        this.open = true;
        this.room = this.game.states.room;

        this.updateRooms();

        this.closeButton.addEventListener('click', this.boundOnClose);

        this.settingsButton.style.fontStyle = 'italic';
        this.container.style.display = 'block';
    }

    destroy() {
        this.open = false;

        this.clearRooms();

        this.closeButton.removeEventListener('click', this.boundOnClose);

        this.settingsButton.style.fontStyle = 'normal';
        this.container.style.display = 'none';
    }
}

module.exports = Settings;
