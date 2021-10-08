const { colourizeImage } = require('./draw');
const { cssColor } = require('@swiftcarrot/color-fns');

const CHARACTER_HEIGHT = 102;

const HEAD_WIDTH = 30;
const HEAD_HEIGHT = 32;

const HAIR_OFFSET_X = 20;
const HAIR_OFFSET_Y = 19;

const FACE_COUNT = 6;
const EYE_COUNT = 5;

class Character {
    constructor(game, room, appearance) {
        this.game = game;
        this.room = room;

        // isometric position
        this.x = 5;
        this.y = 10;

        this.drawX = 0;
        this.drawY = 0;

        this.image = this.game.images['/character_test.png'];

        this.angle = 3;
        this.headIndex = 0;
        this.eyeIndex = 5;
        this.eyeSubIndex = 0;
        this.faceIndex = 2;
        this.faceSubIndex = 0;
        this.hairIndex = 5;
        this.eyeIndex = 1;
        this.eyeSubIndex = 0;
        this.hatIndex = -1;

        this.skinTone = 0;
        this.hairColour = cssColor('#ffff00');
        this.eyeColour = cssColor('#ffffff');
        //this.hatColour = cssColor('#ff0000');

        for (let i = 0; i < 5; i++) {
            const s = this.generateHeadSprite(i);
            document.body.appendChild(s);
        }
    }

    generateHeadSprite(angle) {
        // base canvas
        const headSprite = document.createElement('canvas');

        headSprite.width = 70;
        headSprite.height = 56;

        const headSpriteContext = headSprite.getContext('2d');

        // head
        headSpriteContext.drawImage(
            this.game.images['/character/heads.png'],
            angle * 30,
            this.headIndex * HEAD_HEIGHT,
            HEAD_WIDTH,
            HEAD_HEIGHT,
            HAIR_OFFSET_X,
            HAIR_OFFSET_Y,
            HEAD_WIDTH,
            HEAD_HEIGHT
        );

        // face
        if (angle !== 0 && angle !== 4) {
            headSpriteContext.drawImage(
                this.game.images['/character/faces.png'],
                (angle - 1) * 30,
                (this.faceIndex * (HEAD_HEIGHT * FACE_COUNT)) + (this.faceSubIndex * HEAD_HEIGHT),
                HEAD_WIDTH,
                HEAD_HEIGHT,
                HAIR_OFFSET_X,
                HAIR_OFFSET_Y,
                HEAD_WIDTH,
                HEAD_HEIGHT
            );
        }

        // skin tone
        headSpriteContext.fillStyle = '#000';
        headSpriteContext.globalCompositeOperation = 'source-atop';
        headSpriteContext.globalAlpha = this.skinTone;

        headSpriteContext.fillRect(
            HAIR_OFFSET_X,
            HAIR_OFFSET_Y,
            HEAD_WIDTH,
            HEAD_HEIGHT
        );

        headSpriteContext.globalCompositeOperation = 'source-over';
        headSpriteContext.globalAlpha = 1;

        // eyes
        if (angle !== 0 && angle !== 4) {
            const eyeSprite = document.createElement('canvas');

            eyeSprite.width = HEAD_WIDTH;
            eyeSprite.height = HEAD_HEIGHT;

            const eyeSpriteContext = eyeSprite.getContext('2d');

            eyeSpriteContext.drawImage(
                this.game.images['/character/eyes.png'],
                (angle - 1) * 30,
                5 * HEAD_HEIGHT,
                HEAD_WIDTH,
                HEAD_HEIGHT,
                0,
                0,
                HEAD_WIDTH,
                HEAD_HEIGHT
            );

            colourizeImage(eyeSpriteContext, this.eyeColour);

            headSpriteContext.drawImage(
                eyeSprite,
                HAIR_OFFSET_X,
                HAIR_OFFSET_Y
            );
        }

        // hair
        const hairSprite = document.createElement('canvas');

        hairSprite.width = 70;
        hairSprite.height = 56;

        const hairSpriteContext = hairSprite.getContext('2d');

        hairSpriteContext.drawImage(
            this.game.images['/character/hair.png'],
            70 * angle,
            this.hairIndex * 56,
            70,
            56,
            0,
            0,
            70,
            56
        );

        colourizeImage(hairSpriteContext, this.hairColour);

        headSpriteContext.drawImage(hairSprite, 0, 0);

        // hat
        const hatSprite = document.createElement('canvas');

        hatSprite.width = 70;
        hatSprite.height = 56;

        const hatSpriteContext = hatSprite.getContext('2d');

        hatSpriteContext.drawImage(
            this.game.images['/character/hats.png'],
            angle * 70,
            this.hatIndex * 56,
            70,
            56,
            0,
            0,
            70,
            56
        );

        if (this.hatColour) {
            colourizeImage(hatSpriteContext, this.hatColour);
        }

        headSpriteContext.drawImage(hatSprite, 0, 0);

        return headSprite;
        //document.body.appendChild(headSprite);
    }

    generateSprites() {}

    update() {
        const { x, y } = this.room.isoToCoordinate(this.x, this.y);

        this.drawX = x;
        this.drawY = y - CHARACTER_HEIGHT + this.room.tileHeight - 8;
    }

    draw() {
        const { context } = this.game;
        context.drawImage(this.image, this.drawX, this.drawY);
    }
}

module.exports = Character;
