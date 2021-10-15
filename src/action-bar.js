const Navigation = require('./navigation');

class ActionBar {
    constructor(game) {
        this.game = game;

        this.states = {
            navigation: new Navigation(this.game, false)
        };

        this.buttons = {
            navigation: document.getElementById('coke-music-action-navigation')
        };

        this.events = {};

        for (const name of Object.keys(this.buttons)) {
            this.events[name] = () => {
                const state = this.states[name];

                if (state.open) {
                    state.destroy();
                    this.game.openPanel = null;
                } else {
                    state.init();
                    this.game.openPanel = name;
                }
            };
        }
    }

    init() {
        for (const name of Object.keys(this.buttons)) {
            this.buttons[name].addEventListener('click', this.events[name]);
        }
    }

    destroy() {
        for (const name of Object.keys(this.buttons)) {
            this.buttons[name].removeEventListener('click', this.events[name]);
        }
    }
}

module.exports = ActionBar;
