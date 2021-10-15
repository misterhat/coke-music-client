// sub-state

class Navigation {
    constructor(game, isEntry = true) {
        this.game = game;
        this.isEntry = isEntry;

        this.panel = document.getElementById('coke-music-navigation');
        this.roomTable = document.getElementById('coke-music-studio-table');

        this.closeButton = document.getElementById(
            'coke-music-navigation-close'
        );

        this.open = false;
        this.rooms = [];

        this.boundOnMessage = this.onMessage.bind(this);
        this.boundOnClose = this.onClose.bind(this);
    }

    onMessage(message) {
        if (message.type !== 'rooms') {
            return;
        }

        this.rooms = message.rooms;
        this.clearRoomTable();
        this.updateRoomTable();
    }

    onClose() {
        this.destroy();
    }

    clearRoomTable() {
        this.roomTable.innerHTML = '';
    }

    updateRoomTable() {
        for (const room of this.rooms) {
            console.log(room);

            const tr = document.createElement('tr');

            const countTd = document.createElement('td');
            countTd.textContent = room.characterCount;
            tr.appendChild(countTd);

            const onJoinRoom = () => {
                this.game.write({ type: 'join-room', id: room.id });
            };

            const nameTd = document.createElement('td');
            const nameLink = document.createElement('button');
            nameLink.className = 'coke-music-link';
            nameLink.textContent = room.name;
            nameLink.onclick = onJoinRoom;
            nameTd.appendChild(nameLink);
            tr.appendChild(nameTd);

            const goTd = document.createElement('td');
            const goLink = document.createElement('button');
            goLink.className = 'coke-music-link';
            goLink.textContent = 'Go!';
            goLink.onclick = onJoinRoom;
            goTd.appendChild(goLink);
            tr.appendChild(goTd);

            this.roomTable.append(tr);
        }
    }

    init() {
        this.open = true;

        this.game.on('message', this.boundOnMessage);
        this.closeButton.addEventListener('click', this.boundOnClose);

        this.clearRoomTable();

        this.closeButton.style.display = this.isEntry ? 'none' : 'block';
        this.panel.style.display = 'block';

        this.game.write({ type: 'get-rooms' });
    }

    destroy() {
        this.game.openPanel = null;
        this.open = false;

        this.game.removeListener('message', this.boundOnMessage);
        this.closeButton.removeEventListener('click', this.boundOnClose);

        this.clearRoomTable();

        this.panel.style.display = 'none';
    }
}

module.exports = Navigation;
