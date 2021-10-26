const Character = require('./character');
const { cssColor, rgb2hex } = require('@swiftcarrot/color-fns');

const BUTTONS = ['hair', 'shirt', 'pants', 'shoes'];

const TOTAL_INDEXES = {
    hair: 10, // last is bald? sure
    shirt: 21,
    pants: 10,
    shoes: 5
};

// turn { r, g, b } into a Number for the server
function formatColour(colour) {
    return Number.parseInt(rgb2hex(colour.r, colour.g, colour.b).slice(1), 16);
}

class Appearance {
    constructor(game) {
        this.game = game;

        this.container = document.getElementById('coke-music-appearance');

        this.characterContainer = document.getElementById(
            'coke-music-appearance-character'
        );

        this.colourButtons = {};
        this.colourEvents = {};

        this.previousArrows = {};
        this.previousEvents = {};

        this.nextArrows = {};
        this.nextEvents = {};

        for (const type of BUTTONS) {
            const colourButton = document.getElementById(
                `coke-music-${type}-colour`
            );

            this.colourButtons[type] = colourButton;

            this.colourEvents[type] = this.onChangeColour.bind(
                this,
                colourButton,
                `${type}Colour`
            );

            const previousButton = document.getElementById(
                `coke-music-${type}-previous`
            );

            this.previousArrows[type] = previousButton;
            this.previousEvents[type] = this.onPrevioustButton.bind(this, type);

            const nextButton = document.getElementById(
                `coke-music-${type}-next`
            );

            this.nextArrows[type] = nextButton;
            this.nextEvents[type] = this.onNextButton.bind(this, type);
        }

        this.skinColourRange = document.getElementById(
            'coke-music-skin-colour'
        );

        this.saveButton = document.getElementById('coke-music-appearance-save');

        this.closeButton = document.getElementById(
            'coke-music-appearance-close'
        );

        this.boundSkinColour = this.onSkinColour.bind(this);
        this.boundOnSave = this.onSave.bind(this);
        this.boundOnClose = this.onClose.bind(this);
    }

    onChangeColour(element, characterProperty) {
        element.style.backgroundColor = element.value;
        this.character[characterProperty] = cssColor(element.value);
        this.updateCharacter();
    }

    onPrevioustButton(type) {
        const value = this.character[`${type}Index`];

        this.character[`${type}Index`] =
            value - 1 < 0 ? TOTAL_INDEXES[type] : value - 1;

        this.updateCharacter();
    }

    onNextButton(type) {
        const value = this.character[`${type}Index`];

        this.character[`${type}Index`] =
            value + 1 > TOTAL_INDEXES[type] ? 0 : value + 1;

        this.updateCharacter();
    }

    onSkinColour() {
        const value = Number(this.skinColourRange.value);
        this.character.skinTone = (value / 10) * 0.75;
        this.updateCharacter();
    }

    onSave() {
        this.game.write({
            type: 'appearance',
            faceIndex: 0,
            hairIndex: this.character.hairIndex,
            hairColour: formatColour(this.character.hairColour),
            shirtIndex: this.character.shirtIndex,
            shirtColour: formatColour(this.character.shirtColour),
            pantsIndex: this.character.pantsIndex,
            pantsColour: formatColour(this.character.pantsColour),
            shoesIndex: this.character.shoesIndex,
            shoesColour: formatColour(this.character.shoesColour)
        });

        this.destroy();
    }

    onClose() {
        this.destroy();
    }

    updateCharacter() {
        this.character.generateSprites();
        this.characterContainer.style.backgroundImage = `url(${this.character.sprites.idle[2].toDataURL()})`;
    }

    // update the HTML to match the character attributes
    sync() {
        for (const type of BUTTONS) {
            const colourButton = this.colourButtons[type];
            const colour = this.character[`${type}Colour`];

            colourButton.value = rgb2hex(colour.r, colour.g, colour.b);
        }

        this.skinColourRange.value = Math.floor(
            (this.character.skinTone / 0.75) * Number(this.skinColourRange.max)
        );
    }

    init() {
        this.open = true;

        for (const type of BUTTONS) {
            this.colourButtons[type].addEventListener(
                'change',
                this.colourEvents[type]
            );

            this.previousArrows[type].addEventListener(
                'click',
                this.previousEvents[type]
            );

            this.nextArrows[type].addEventListener(
                'click',
                this.nextEvents[type]
            );
        }

        this.skinColourRange.addEventListener('click', this.boundSkinColour);
        this.saveButton.addEventListener('click', this.boundOnSave);
        this.closeButton.addEventListener('click', this.boundOnClose);

        this.updateCharacter();
        this.sync();

        this.container.style.display = 'block';
    }

    destroy() {
        this.open = false;

        this.container.style.display = 'none';

        for (const type of BUTTONS) {
            this.colourButtons[type].addEventListener(
                'change',
                this.colourEvents[type]
            );

            this.previousArrows[type].addEventListener(
                'click',
                this.previousEvents[type]
            );

            this.nextArrows[type].addEventListener(
                'click',
                this.nextEvents[type]
            );
        }

        this.skinColourRange.removeEventListener('click', this.boundSkinColour);
        this.saveButton.addEventListener('click', this.boundOnSave);
        this.closeButton.addEventListener('click', this.boundOnClose);
    }
}

module.exports = Appearance;
