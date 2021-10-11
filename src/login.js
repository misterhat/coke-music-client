class Login {
    constructor(game) {
        this.game = game;

        this.panel = document.getElementById('coke-music-login');

        this.loginError = document.getElementById('coke-music-login-error');

        this.usernameInput = document.getElementById(
            'coke-music-login-username'
        );

        this.passwordInput = document.getElementById(
            'coke-music-login-password'
        );

        this.loginButton = document.getElementById('coke-music-login-button');
    }

    showError(message) {
        this.loginError.style.display = 'block';
        this.loginButton.disabled = false;
        this.loginError.textContent = message;
    }

    addEventListeners() {
        this.onMessage = (message) => {
            if (message.type === 'login-response') {
                if (!message.success) {
                    this.showError(message.error);
                    return;
                }

                this.game.characterID = message.id;

                this.game.changeState('entry');
            }
        };

        this.game.on('message', this.onMessage);

        this.onLoginClick = async () => {
            this.loginButton.disabled = true;

            const username = this.usernameInput.value.trim();
            const password = this.passwordInput.value.trim();

            if (!username.length || !password.length) {
                this.showError('Please enter a username and password.');
                return;
            }

            try {
                await this.game.connect();
            } catch (e) {
                this.showError('Unable to connect.');
                return;
            }

            this.game.write({ type: 'login', username, password });
        };

        this.loginButton.addEventListener('click', this.onLoginClick);

        this.onUsernameEnter = (event) => {
            if (event.key === 'Enter') {
                this.passwordInput.focus();
            }
        };

        this.usernameInput.addEventListener('keypress', this.onUsernameEnter);

        this.onPasswordEnter = (event) => {
            if (event.key === 'Enter') {
                this.onLoginClick();
            }
        };

        this.passwordInput.addEventListener('keypress', this.onPasswordEnter);
    }

    init() {
        this.addEventListeners();

        this.panel.style.display = 'block';
        this.loginError.style.display = 'none';
        this.loginButton.disabled = false;

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
        this.game.removeListener('message', this.onMessage);

        this.loginButton.removeEventListener('click', this.onLoginClick);

        this.usernameInput.removeEventListener(
            'keypress',
            this.onUsernameEnter
        );

        this.passwordInput.value = '';

        this.passwordInput.removeEventListener(
            'keypress',
            this.onPasswordEnter
        );

        this.panel.style.display = 'none';
    }
}

module.exports = Login;
