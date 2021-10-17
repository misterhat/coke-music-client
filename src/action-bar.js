class ActionBar {
    constructor(game) {
        this.game = game;

        this.states = {
            navigation: this.game.navigation,
            inventory: this.game.inventory
        };

        this.buttons = {
            navigation: document.getElementById('coke-music-action-navigation'),
            inventory: document.getElementById('coke-music-action-inventory')
        };

        this.events = {};

        this.state = null;

        for (const name of Object.keys(this.buttons)) {
            this.events[name] = () => {
                const state = this.states[name];

                if (this.state && this.state !== state) {
                    this.state.destroy();
                }

                this.state = state;

                if (state.open) {
                    state.destroy();
                    this.toggleSelected(name, false);
                } else {
                    this.game.settings.destroy();
                    state.init({ isEntry: false });
                    this.toggleSelected(name, true);
                }
            };
        }
    }

    toggleSelected(name, selected = false) {
        const button = this.buttons[name];

        if (selected) {
            button.classList.add('coke-music-action-selected');
        } else {
            button.classList.remove('coke-music-action-selected');
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
