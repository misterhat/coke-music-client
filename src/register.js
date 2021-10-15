const AccountPanel = require('./account-panel');

class Register extends AccountPanel {
    constructor(game) {
        super(game, 'register');

        this.usernameInput = document.getElementById(
            'coke-music-register-username'
        );

        this.emailInput = document.getElementById('coke-music-register-email');

        this.passwordInput = document.getElementById(
            'coke-music-register-password'
        );

        this.confirmPasswordInput = document.getElementById(
            'coke-music-register-password-confirm'
        );

        this.registerButton = document.getElementById(
            'coke-music-register-register-button'
        );

        this.loginButton = document.getElementById(
            'coke-music-register-login-button'
        );

        this.boundOnMessage = this.onMessage.bind(this);
        this.boundOnRegisterClick = this.onRegisterClick.bind(this);
        this.boundOnConfirmEnter = this.onConfirmEnter.bind(this);
        this.boundOnLoginClick = this.onLoginClick.bind(this);
    }

    onMessage(message) {
        if (message.type !== 'register-response') {
            return;
        }

        this.registerButton.disabled = false;

        if (!message.success) {
            this.showError(message.message);
            return;
        }

        alert('registered!');
    }

    async onRegisterClick() {
        const username = this.usernameInput.value.trim();

        if (username.length < 3 || username.length > 20) {
            this.showError('Username must be between 3-20 characters.');
            return;
        }

        const email = this.emailInput.value.trim();

        if (!email.length) {
            this.showError('Please enter an e-mail address.');
            return;
        }

        const password = this.passwordInput.value.trim();
        const confirmPassword = this.confirmPasswordInput.value.trim();

        if (password.length < 3) {
            this.showError('Password must be at least 3 characters.');
            return;
        }

        if (password !== confirmPassword) {
            this.showError('Passwords do not match.');
            return;
        }

        this.registerButton.disabled = true;

        try {
            await this.game.connect();
        } catch (e) {
            this.showError('Unable to connect.');
            this.registerButton.disabled = false;
            return;
        }

        this.game.write({
            type: 'register',
            username,
            email,
            password
        });
    }

    onConfirmEnter(event) {
        if (event.key === 'Enter') {
            this.onRegisterClick();
        }
    }

    onLoginClick() {
        this.game.changeState('login');
    }

    init() {
        super.init();

        this.game.on('message', this.boundOnMessage);

        this.registerButton.addEventListener(
            'click',
            this.boundOnRegisterClick
        );

        this.confirmPasswordInput.addEventListener(
            'keypress',
            this.boundOnConfirmEnter
        );

        this.loginButton.addEventListener('click', this.boundOnLoginClick);

        this.registerButton.disabled = false;
    }

    destroy() {
        super.destroy();

        this.game.removeListener('message', this.boundOnMessage);

        this.registerButton.removeEventListener(
            'click',
            this.boundOnRegisterClick
        );

        this.confirmPasswordInput.removeEventListener(
            'keypress',
            this.boundOnConfirmEnter
        );

        this.loginButton.removeEventListener('click', this.boundOnLoginClick);
    }
}

module.exports = Register;
