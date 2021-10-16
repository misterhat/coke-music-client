const { createCanvas, colourizeImage } = require('./draw');
const { cssColor } = require('@swiftcarrot/color-fns');

// TODO move this
const TILE_WIDTH = 70;

const MAX_MESSAGES = 6;

class Chat {
    constructor(game) {
        this.game = game;

        this.input = document.getElementById('coke-music-chat-input');
        this.messageList = document.getElementById('coke-music-chat-messages');

        this.messageLength = 0;

        this.boundOnChat = this.onChat.bind(this);
    }

    onChat(event) {
        if (event.key === 'Enter') {
            const message = this.input.value.trim();

            this.input.value = '';

            if (!message.length) {
                return;
            }

            this.game.write({ type: 'chat', message });
        }
    }

    addChatMessage({ username, message, x: isoX, y: isoY }) {
        this.messageLength += 1;

        const messageLi = document.createElement('li');

        const { canvas: nameCanvas, context: nameContext } = createCanvas(
            this.nameImage.width,
            this.nameImage.height
        );

        nameContext.drawImage(this.nameImage, 0, 0);

        colourizeImage(nameCanvas, cssColor('#ff0000'));

        const nameSpan = document.createElement('span');

        nameSpan.className = 'coke-music-chat-name';
        nameSpan.style.backgroundImage = `url(${nameCanvas.toDataURL()})`;
        nameSpan.textContent = username;

        messageLi.appendChild(nameSpan);

        const messageSpan = document.createElement('span');

        messageSpan.className = 'coke-music-chat-message';
        messageSpan.textContent = message;

        messageLi.appendChild(messageSpan);

        this.messageList.style.top = `${
            Math.max(0, MAX_MESSAGES - this.messageLength) * 25 + 44
        }px`;

        this.messageList.appendChild(messageLi);
        this.messageList.appendChild(document.createElement('br'));

        this.messageList.scrollTop = this.messageLength * 25;

        let { x } = this.room.isoToCoordinate(isoX, isoY);

        x -= Math.floor(messageLi.offsetWidth / 2);
        x += TILE_WIDTH / 2;

        messageLi.style.left = `${x}px`;
    }

    clearChatMessages() {
        this.messageList.innerHTML = '';
    }

    init() {
        this.room = this.game.states.room;

        // used for chat usernames
        this.nameImage = this.game.images['/message_name.png'];

        this.input.addEventListener('keypress', this.boundOnChat);
    }

    destroy() {
        this.clearChatMessages();

        this.input.removeEventListener('keypress', this.boundOnChat);
    }
}

module.exports = Chat;
