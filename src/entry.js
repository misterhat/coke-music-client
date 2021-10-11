class Entry {
    constructor(game) {
        this.game = game;

        this.rooms = [];

        this.panel = document.getElementById('coke-music-navigation');
        this.roomTable = document.getElementById('coke-music-studio-table');
    }

    init() {
        this.panel.style.display = 'block';

        this.backgroundImage = this.game.images['/entry.png'];

        this.backgroundOffsetX = Math.floor(
            this.game.canvas.width / 2 - this.backgroundImage.width / 2
        );

        this.backgroundOffsetY = Math.floor(
            this.game.canvas.height / 2 - this.backgroundImage.height / 2
        );

        this.onMessage = (message) => {
            switch (message.type) {
                case 'rooms':
                    this.rooms = message.rooms;
                    this.clearRoomTable();
                    this.updateRoomTable();
                    break;
                case 'join-room':
                    this.game.changeState('room', {
                        name: message.name,
                        characters: message.characters
                    });
                    break;
            }
        };

        this.game.on('message', this.onMessage);
        this.game.write({ type: 'get-rooms' });
    }

    update() {}

    draw() {
        const { context } = this.game;

        context.drawImage(
            this.backgroundImage,
            this.backgroundOffsetX,
            this.backgroundOffsetY
        );
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

    clearRoomTable() {
        this.roomTable.innerHTML = '';
    }

    destroy() {
        this.game.removeListener('message', this.onMessage);

        this.clearRoomTable();
        this.panel.style.display = 'none';
    }
}

module.exports = Entry;
