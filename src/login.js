class Login {
    constructor(game) {
        this.game = game;

        this.loginPanel = document.getElementById('coke-music-login');

        this.usernameInput = document.getElementById(
            'coke-music-login-username'
        );

        this.passwordInput = document.getElementById(
            'coke-music-login-password'
        );

        this.loginButton = document.getElementById('coke-music-login-button');

        // TODO put event listeners in map and remove them in destroy
    }

    addEventListeners() {
        this.game.socket.addEventListener('message', ({ data }) => {
            try {
                data = JSON.parse(data);
            } catch (e) {
                console.error(`malformed json ${data}`);
            }

            if (data.type === 'login-response' && data.success) {
                this.game.changeState('room', data.studio);
            }
        });

        this.loginButton.addEventListener('click', () => {
            this.loginButton.disabled = true;

            this.game.write({
                type: 'login',
                username: this.usernameInput.value.trim(),
                password: this.passwordInput.value.trim()
            });
        });
    }

    init() {
        this.loginPanel.style.display = 'block';
        this.loginButton.disabled = false;

        this.addEventListeners();
    }

    update() {}

    draw() {}

    destroy() {
        this.loginPanel.style.display = 'none';
    }
}

module.exports = Login;
