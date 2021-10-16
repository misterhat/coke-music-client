class Settings {
    constructor(game) {
        this.game = game;

        this.container = document.getElementById('coke-music-studio-settings');

        this.settingsButton = document.getElementById(
            'coke-music-toggle-settings'
        );

        this.open = false;
    }

    init() {
        this.open = true;

        this.settingsButton.style.fontStyle = 'italic';
        this.container.style.display = 'block';
    }

    destroy() {
        this.open = false;

        this.settingsButton.style.fontStyle = 'normal';
        this.container.style.display = 'none';
    }
}

module.exports = Settings;
