const Character = require('./character');
const { cssColor } = require('@swiftcarrot/color-fns');

const BUTTONS = ['hair', 'shirt', 'pants', 'shoes'];

const TOTAL_INDEXES = {
    hair: 10, // last is bald? sure
    shirt: 21,
    pants: 10,
    shoes: 1
};

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

        this.boundSkinColour = this.onSkinColour.bind(this);
    }

    onChangeColour(element, characterProperty) {
        element.style.backgroundColor = element.value;
        this.character[characterProperty] = cssColor(element.value);
        this.updateCharacter();
    }

    // TODO limits

    onPrevioustButton(type) {
        this.character[`${type}Index`] -= 1;
        this.updateCharacter();
    }

    onNextButton(type) {
        console.log('next', type);
        this.character[`${type}Index`] += 1;
        this.updateCharacter();
    }

    onSkinColour() {
        const value = Number(this.skinColourRange.value);
        this.character.skinTone = (value / 10) * 0.75;
        this.updateCharacter();
    }

    updateCharacter() {
        this.character.generateSprites();
        this.characterContainer.style.backgroundImage = `url(${this.character.sprites.idle[7].toDataURL()})`;
    }

    init() {
        this.character = new Character(this.game, null, {});

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

        this.updateCharacter();

        this.container.style.display = 'block';
    }

    destroy() {
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
    }
}

module.exports = Appearance;
