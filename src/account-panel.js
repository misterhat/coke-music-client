// parent of registration and login panels

class AccountPanel {
    constructor(game, type) {
        this.game = game;

        this.panel = document.getElementById(`coke-music-${type}`);
        this.error = document.getElementById(`coke-music-${type}-error`);

        this.usernameInput = document.getElementById(
            `coke-music-${type}-username`
        );

        this.passwordInput = document.getElementById(
            `coke-music-${type}-password`
        );

        this.statusIngame = document.getElementById('coke-music-status-ingame');
    }

    showError(message) {
        this.error.style.display = 'block';
        this.loginButton.disabled = false;
        this.error.textContent = message;
    }

    init() {
        this.statusIngame.style.display = 'none';

        this.panel.style.display = 'block';
        this.error.style.display = 'none';

        this.backgroundImage = this.game.images['/entry.png'];

        this.backgroundOffsetX = Math.floor(
            this.game.canvas.width / 2 - this.backgroundImage.width / 2
        );

        this.backgroundOffsetY = Math.floor(
            this.game.canvas.height / 2 - this.backgroundImage.height / 2
        );
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

    destroy() {
        this.panel.style.display = 'none';
    }
}

module.exports = AccountPanel;
