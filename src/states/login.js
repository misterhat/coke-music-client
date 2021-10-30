const AccountPanel = require('./account-panel');
const Character = require('../entities/character');

class Login extends AccountPanel {
    constructor(game) {
        super(game, 'login');

        this.loginButton = document.getElementById('coke-music-login-button');

        this.registerButton = document.getElementById(
            'coke-music-login-register-button'
        );

        this.statusIngame = document.getElementById('coke-music-status-ingame');

        this.boundOnMessage = this.onMessage.bind(this);
        this.boundOnLoginClick = this.onLoginClick.bind(this);
        this.boundOnRegisterClick = this.onRegisterClick.bind(this);
        this.boundOnUsernameEnter = this.onUsernameEnter.bind(this);
        this.boundOnPasswordEnter = this.onPasswordEnter.bind(this);
    }

    onMessage(message) {
        if (message.type !== 'login-response') {
            return;
        }

        this.loginButton.disabled = false;

        if (!message.success) {
            this.showError(message.message);
            return;
        }

        this.game.characterID = message.id;

        this.game.appearance.character = new Character(
            this.game,
            null,
            message
        );

        this.game.changeState('entry');
    }

    async onLoginClick() {
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
            this.loginButton.disabled = false;
            return;
        }

        this.game.write({ type: 'login', username, password });
    }

    onUsernameEnter(event) {
        if (event.key === 'Enter') {
            this.passwordInput.focus();
        }
    }

    onPasswordEnter(event) {
        if (event.key === 'Enter') {
            this.onLoginClick();
        }
    }

    onRegisterClick() {
        this.game.changeState('register');
    }

    init() {
        super.init();

        this.game.on('message', this.boundOnMessage);

        this.loginButton.addEventListener('click', this.boundOnLoginClick);

        this.usernameInput.addEventListener(
            'keypress',
            this.boundOnUsernameEnter
        );

        this.passwordInput.addEventListener(
            'keypress',
            this.boundOnPasswordEnter
        );

        this.registerButton.addEventListener(
            'click',
            this.boundOnRegisterClick
        );

        this.loginButton.disabled = false;
    }

    update() {}

    destroy() {
        super.destroy();

        this.game.removeListener('message', this.boundOnMessage);

        this.loginButton.removeEventListener('click', this.boundOnLoginClick);

        this.usernameInput.removeEventListener(
            'keypress',
            this.boundOnUsernameEnter
        );

        this.passwordInput.value = '';

        this.passwordInput.removeEventListener(
            'keypress',
            this.boundOnPasswordEnter
        );
    }
}

module.exports = Login;
