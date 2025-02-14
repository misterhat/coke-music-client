// sub-state

class Navigation {
    constructor(game) {
        this.game = game;

        this.panel = document.getElementById('coke-music-navigation');

        this.closeButton = document.getElementById(
            'coke-music-navigation-close'
        );

        this.roomTableWrap = document.getElementById(
            'coke-music-studio-table-wrap'
        );

        this.roomTable = document.getElementById('coke-music-studio-table');

        this.showActiveButton = document.getElementById(
            'coke-music-active-studios'
        );

        this.showMineButton = document.getElementById('coke-music-my-studios');

        this.noStudios = document.getElementById('coke-music-no-studios');

        this.createButton = document.getElementById('coke-music-create-studio');
        this.logoutButton = document.getElementById('coke-music-logout');

        this.open = false;

        this.showActive = false;
        this.showMine = false;

        this.rooms = [];

        this.boundOnMessage = this.onMessage.bind(this);
        this.boundOnClose = this.onClose.bind(this);
        this.boundOnShowActive = this.onShowActive.bind(this);
        this.boundOnShowMine = this.onShowMine.bind(this);
        this.boundOnCreate = this.onCreate.bind(this);
        this.boundOnLogout = this.onLogout.bind(this);
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

    onShowActive() {
        this.showActive = !this.showActive;
        this.showMine = false;

        this.game.write({ type: 'get-rooms', active: this.showActive });
    }

    onShowMine() {
        this.showMine = !this.showMine;
        this.showActive = false;

        this.game.write({ type: 'get-rooms', mine: this.showMine });
    }

    onCreate() {
        this.game.write({ type: 'create-room' });
    }

    onLogout() {
        if (this.game.socket) {
            this.game.socket.close();
        }
    }

    clearRoomTable() {
        this.roomTable.innerHTML = '';
    }

    updateRoomTable() {
        if (!this.rooms.length) {
            this.noStudios.style.display = 'block';
            this.roomTableWrap.style.display = 'none';
        } else {
            this.noStudios.style.display = 'none';
            this.roomTableWrap.style.display = 'block';
        }

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
            nameLink.textContent = room.studio;
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

    init({ isEntry }) {
        this.isEntry = isEntry;

        this.open = true;

        this.game.on('message', this.boundOnMessage);
        this.closeButton.addEventListener('click', this.boundOnClose);
        this.showActiveButton.addEventListener('click', this.boundOnShowActive);
        this.showMineButton.addEventListener('click', this.boundOnShowMine);
        this.createButton.addEventListener('click', this.boundOnCreate);
        this.logoutButton.addEventListener('click', this.boundOnLogout);

        this.clearRoomTable();

        this.closeButton.style.display = this.isEntry ? 'none' : 'block';
        this.panel.style.display = 'block';

        this.game.write({ type: 'get-rooms' });
    }

    destroy() {
        this.game.actionBar.toggleSelected('navigation', false);

        this.open = false;

        this.game.removeListener('message', this.boundOnMessage);
        this.closeButton.removeEventListener('click', this.boundOnClose);

        this.showActiveButton.removeEventListener(
            'click',
            this.boundOnShowActive
        );

        this.showMineButton.removeEventListener('click', this.boundOnShowMine);
        this.createButton.removeEventListener('click', this.boundOnCreate);
        this.logoutButton.removeEventListener('click', this.boundOnLogout);

        this.panel.style.display = 'none';

        this.clearRoomTable();
    }
}

module.exports = Navigation;
