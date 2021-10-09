const { colourizeImage } = require('./draw');
const { cssColor } = require('@swiftcarrot/color-fns');

const CHARACTER_HEIGHT = 102;

// width of base head sprite in sprite sheet
const HEAD_WIDTH = 30;
const HEAD_HEIGHT = 32;

// amount to offset the head sprites on the base head image
const HEAD_OFFSET_X = 20;
const HEAD_OFFSET_Y = 19;

// width of hair and accessories
const HAIR_WIDTH = 70;
const HAIR_HEIGHT = 56;

const BODY_WIDTH = 56;
const BODY_HEIGHT = 70;

// amount of sub-faces
const FACE_COUNT = 6;

// amount of sub-eyes
const EYE_COUNT = 5;

// amount of sub-bodies
const BODY_COUNT = 6;

// offsets for applying the head sprite to the final image
const BODY_ANGLE_OFFSETS = [
    { x: 13, y: 43 },
    { x: 9, y: 42 },
    { x: 11, y: 46 },
    { x: 7, y: 43 },
    { x: 9, y: 43 }
];

// ne, e, se, s, n, [sw, w nw]

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

        this.isFemale = true;

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
        this.bodyIndex = 0;

        this.skinTone = 0.25;

        this.hairColour = cssColor('#ff0000');
        this.eyeColour = cssColor('#ffffff');
        //this.hatColour = cssColor('#ff0000');

        /*
        for (let i = 0; i < 5; i++) {
            const s = this.generateHeadSprite(i);
            document.body.appendChild(s);
        }

        for (let i = 0; i < 5; i++) {
            const s = this.generateBodySprite(i);
            document.body.appendChild(s);
        }*/

        // ne, e, se, s, n, [sw, w nw] <- autogenerated
        this.sprites = {
            idle: [],
            sit: [],
            walk: []
        };

        this.generateSprites();
    }

    generateHeadSprite(angle) {
        // base canvas
        const headSprite = document.createElement('canvas');

        headSprite.width = HAIR_WIDTH;
        headSprite.height = HAIR_HEIGHT;

        const headSpriteContext = headSprite.getContext('2d');

        // head
        headSpriteContext.drawImage(
            this.game.images['/character/heads.png'],
            angle * HEAD_WIDTH,
            this.headIndex * HEAD_HEIGHT,
            HEAD_WIDTH,
            HEAD_HEIGHT,
            HEAD_OFFSET_X,
            HEAD_OFFSET_Y,
            HEAD_WIDTH,
            HEAD_HEIGHT
        );

        // face
        if (angle !== 0 && angle !== 4) {
            headSpriteContext.drawImage(
                this.game.images['/character/faces.png'],
                (angle - 1) * HEAD_WIDTH,
                this.faceIndex * (HEAD_HEIGHT * FACE_COUNT) +
                    this.faceSubIndex * HEAD_HEIGHT,
                HEAD_WIDTH,
                HEAD_HEIGHT,
                HEAD_OFFSET_X,
                HEAD_OFFSET_Y,
                HEAD_WIDTH,
                HEAD_HEIGHT
            );
        }

        // skin tone
        headSpriteContext.fillStyle = '#000';
        headSpriteContext.globalCompositeOperation = 'source-atop';
        headSpriteContext.globalAlpha = this.skinTone;

        headSpriteContext.fillRect(
            HEAD_OFFSET_X,
            HEAD_OFFSET_Y,
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
                (angle - 1) * HEAD_WIDTH,
                this.eyeIndex * (HEAD_HEIGHT * EYE_COUNT) +
                    this.eyeSubIndex * HEAD_HEIGHT,
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
                HEAD_OFFSET_X,
                HEAD_OFFSET_Y
            );
        }

        // hair
        const hairSprite = document.createElement('canvas');

        hairSprite.width = HAIR_WIDTH;
        hairSprite.height = HAIR_HEIGHT;

        const hairSpriteContext = hairSprite.getContext('2d');

        hairSpriteContext.drawImage(
            this.game.images['/character/hair.png'],
            angle * HAIR_WIDTH,
            this.hairIndex * HAIR_HEIGHT,
            HAIR_WIDTH,
            HAIR_HEIGHT,
            0,
            0,
            HAIR_WIDTH,
            HAIR_HEIGHT
        );

        colourizeImage(hairSpriteContext, this.hairColour);

        headSpriteContext.drawImage(hairSprite, 0, 0);

        // hat
        if (this.hatIndex !== -1) {
            const hatSprite = document.createElement('canvas');

            hatSprite.width = HAIR_WIDTH;
            hatSprite.height = HAIR_HEIGHT;

            const hatSpriteContext = hatSprite.getContext('2d');

            hatSpriteContext.drawImage(
                this.game.images['/character/hats.png'],
                angle * HAIR_WIDTH,
                this.hatIndex * HAIR_HEIGHT,
                HAIR_WIDTH,
                HAIR_HEIGHT,
                0,
                0,
                HAIR_WIDTH,
                HAIR_HEIGHT
            );

            if (this.hatColour) {
                colourizeImage(hatSpriteContext, this.hatColour);
            }

            headSpriteContext.drawImage(hatSprite, 0, 0);
        }

        return headSprite;
    }

    generateBodySprite(angle) {
        // base canvas
        const bodySprite = document.createElement('canvas');

        bodySprite.width = BODY_WIDTH;
        bodySprite.height = BODY_HEIGHT;

        const bodySpriteContext = bodySprite.getContext('2d');

        bodySpriteContext.drawImage(
            this.game.images['/character/bodies.png'],
            angle * BODY_WIDTH,
            (this.isFemale ? BODY_COUNT * BODY_HEIGHT : 0) +
                this.bodyIndex * BODY_HEIGHT,
            BODY_WIDTH,
            BODY_HEIGHT,
            0,
            0,
            BODY_WIDTH,
            BODY_HEIGHT
        );

        // skin tone
        bodySpriteContext.fillStyle = '#000';
        bodySpriteContext.globalCompositeOperation = 'source-atop';
        bodySpriteContext.globalAlpha = this.skinTone;

        bodySpriteContext.fillRect(
            0,
            0,
            BODY_WIDTH,
            BODY_HEIGHT
        );

        bodySpriteContext.globalCompositeOperation = 'source-over';
        bodySpriteContext.globalAlpha = 1;

        return bodySprite;
    }

    generateSprites() {
        for (let angle = 0; angle < 5; angle += 1) {
            const baseSprite = document.createElement('canvas');

            baseSprite.width = 56;
            baseSprite.height = 116;

            const baseSpriteContext = baseSprite.getContext('2d');

            const bodySprite = this.generateBodySprite(angle);
            const headSprite = this.generateHeadSprite(angle);

            baseSpriteContext.drawImage(
                bodySprite,
                BODY_ANGLE_OFFSETS[angle].x,
                BODY_ANGLE_OFFSETS[angle].y,
            );

            baseSpriteContext.drawImage(
                headSprite,
                0,
                0
            );

            if (angle === 3) {
                this.image = baseSprite;
            }

            document.body.appendChild(baseSprite);
        }
    }

    update() {
        const { x, y } = this.room.isoToCoordinate(this.x, this.y);

        this.drawX = x;
        this.drawY = y - 116 + 28;
    }

    draw() {
        const { context } = this.game;
        context.drawImage(this.image, this.drawX, this.drawY);
    }
}

module.exports = Character;
