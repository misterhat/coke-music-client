const shirts = require('coke-music-data/shirts.json');
const { createCanvas, colourizeImage, intToRGB } = require('./draw');

// size of base head sprite in spritesheet
const HEAD_WIDTH = 30;
const HEAD_HEIGHT = 32;

// amount to offset the head sprites on the base head image
const HEAD_OFFSET_X = 20;
const HEAD_OFFSET_Y = 19;

// size of hair and accessories
const HAIR_WIDTH = 70;
const HAIR_HEIGHT = 56;

// size of body in spritesheet
const BODY_WIDTH = 56;
const BODY_HEIGHT = 70;

// size of arms in spritesheet
const ARM_SIZE = 36;

// amount of sub-faces
const FACE_COUNT = 6;

// amount of sub-eyes
const EYE_COUNT = 5;

// amount of sub-bodies
const BODY_COUNT = 6;

// amount of sub-heads
const HEAD_COUNT = 3;

// offsets for applying the head sprite to the final character sprite
const BODY_ANGLE_OFFSETS = [
    { x: 13, y: 43 },
    { x: 9, y: 42 },
    { x: 11, y: 46 },
    { x: 7, y: 43 },
    { x: 9, y: 43 }
];

// [deltaX][deltaY] = spriteOffset
// to determine which direction should display which sprite
const WALK_ANGLE_DELTAS = {
    '-1': {
        // west
        1: 1, // south
        '-1': 3, // north
        0: 2
    },
    1: {
        // east
        1: 4, // south
        '-1': 6, // north east
        0: 5
    },
    0: {
        1: 0, // south
        '-1': 7,
        0: 3
    }
};

// x offsets for post-rotated character sprites
const ROTATED_OFFSETS = [-16, -10, -13];

// { bodyIndex: { angle: [ { index: armIndex, x, y, rotate: false } ] }
const ARM_OFFSETS = {
    0: {
        // idle
        0: [
            { index: 0, x: 12, y: 6 },
            { index: 2, x: -4, y: 5 }
        ],
        1: [{ index: 1, x: 5, y: 6 }],
        2: [
            { index: 4, x: 9, y: 3 },
            //{ index: 5, x: -2, y: 5 } right
            { index: 6, x: 0, y: 5 }
        ],
        3: [
            { index: 6, x: 1, y: 3 },
            { index: 6, x: 18, y: 3, rotate: true }
        ],
        4: [
            { index: 3, x: -2, y: 4 },
            { index: 3, x: 17, y: 4, rotate: true }
        ]
    },

    1: {
        // sit
        0: [
            { index: 0, x: 12, y: 6 },
            { index: 2, x: -4, y: 5 }
        ],
        1: [{ index: 1, x: 5, y: 6 }],
        2: [
            { index: 4, x: 9, y: 3 },
            //{ index: 5, x: -2, y: 5 } right
            { index: 6, x: 0, y: 5 }
        ],
        3: [
            { index: 6, x: 1, y: 3 },
            { index: 6, x: 18, y: 3, rotate: true }
        ],
        4: [
            { index: 3, x: -2, y: 4 },
            { index: 3, x: 17, y: 4, rotate: true }
        ]
    },

    2: {
        // walk0
        0: [
            { index: 0, x: 12, y: 6 },
            { index: 2, x: -4, y: 5 }
        ],
        1: [{ index: 0, x: 6, y: 7 }],
        2: [
            { index: 6, x: 0, y: 4 },
            { index: 4, x: 10, y: 4 }
        ],
        3: [
            { index: 7, x: 1, y: 2 },
            { index: 10, x: 16, y: 2 }
        ],
        4: [
            { index: 15, x: -1, y: 4 },
            { index: 3, x: 16, y: 4, rotate: true }
        ]
    },
    3: {
        // walk1
        0: [
            { index: 0, x: 12, y: 6 },
            { index: 2, x: -4, y: 5 }
        ],
        1: [{ index: 0, x: 6, y: 7 }],
        2: [
            { index: 6, x: 0, y: 4 },
            { index: 4, x: 10, y: 4 }
        ],
        3: [
            { index: 7, x: 1, y: 2 },
            { index: 10, x: 16, y: 2 }
        ],
        4: [
            { index: 15, x: -1, y: 4 },
            { index: 3, x: 16, y: 4, rotate: true }
        ]
    },
    4: {
        // walk2
        0: [
            { index: 3, x: -4, y: 3 },
            { index: 1, x: 12, y: 7 }
        ],
        1: [{ index: 1, x: 6, y: 8 }],
        2: [{ index: 5, x: 0, y: 4 }],
        3: [
            { index: 7, x: 18, y: 1, rotate: true },
            { index: 10, x: 3, y: 2, rotate: true }
        ],
        4: [
            { index: 15, x: 16, y: 4, rotate: true },
            { index: 3, x: -1, y: 4 } // could be x: -2
        ]
    },
    5: {
        // walk3
        0: [
            { index: 3, x: -4, y: 3 },
            { index: 1, x: 12, y: 7 }
        ],
        1: [{ index: 1, x: 6, y: 8 }],
        2: [{ index: 5, x: 0, y: 4 }],
        3: [
            { index: 7, x: 18, y: 1, rotate: true },
            { index: 10, x: 3, y: 2, rotate: true }
        ],
        4: [
            { index: 15, x: 16, y: 4, rotate: true },
            { index: 3, x: -1, y: 4 } // could be x: -2
        ]
    }
};

const BODY_INDEX_SPRITE_NAMES = {
    0: 'idle',
    1: 'sit',
    2: 'walk0',
    3: 'walk1',
    4: 'walk2',
    5: 'walk3'
};

const DRAW_OFFSET_Y = 88;

// ne, e, se, s, n, [sw, w nw]

class Character {
    constructor(game, room, data) {
        this.game = game;
        this.room = room;

        this.username = data.username;
        this.id = data.id;

        // isometric position
        this.x = data.x;
        this.y = data.y;

        this.drawX = 0;
        this.drawY = 0;

        this.isFemale = !!data.isFemale;

        this.angle = data.angle || 0;
        this.walkIndex = -1;

        this.updateAppearance(data);

        // used to drag the sprite in animation
        this.toDrawX = 0;
        this.toDrawY = 0;

        this.drawOffsetX = 0;
        this.drawOffsetY = 0;

        this.toX = -1;
        this.toY = -1;

        this.walkSpeed = 5;

        this.isSitting = false;
        this.sitting = null;

        this.idleStepTimeout = null;
    }

    generateHeadSprite(angle) {
        // base canvas
        const { canvas: headSprite, context: headContext } = createCanvas(
            HAIR_WIDTH,
            HAIR_HEIGHT
        );

        // head
        headContext.drawImage(
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
            headContext.drawImage(
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
        headContext.fillStyle = '#000';
        headContext.globalCompositeOperation = 'source-atop';
        headContext.globalAlpha = this.skinTone;

        headContext.fillRect(
            HEAD_OFFSET_X,
            HEAD_OFFSET_Y,
            HEAD_WIDTH,
            HEAD_HEIGHT
        );

        headContext.globalCompositeOperation = 'source-over';
        headContext.globalAlpha = 1;

        // eyes
        if (angle !== 0 && angle !== 4) {
            const { canvas: eyeSprite, context: eyeContext } = createCanvas(
                HEAD_WIDTH,
                HEAD_HEIGHT
            );

            eyeContext.drawImage(
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

            //colourizeImage(eyeSprite, this.eyeColour);

            headContext.drawImage(eyeSprite, HEAD_OFFSET_X, HEAD_OFFSET_Y);
        }

        // hair
        const { canvas: hairSprite, context: hairContext } = createCanvas(
            HAIR_WIDTH,
            HAIR_HEIGHT
        );

        hairContext.drawImage(
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

        colourizeImage(hairSprite, this.hairColour);

        headContext.drawImage(hairSprite, 0, 0);

        // hat
        if (this.hatIndex !== -1) {
            const { canvas: hatSprite, context: hatContext } = createCanvas(
                HAIR_WIDTH,
                HAIR_HEIGHT
            );

            hatContext.drawImage(
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
                colourizeImage(hatSprite, this.hatColour);
            }

            headContext.drawImage(hatSprite, 0, 0);
        }

        return headSprite;
    }

    drawShirt(bodyContext, angle) {
        if (this.shirtIndex === -1) {
            return;
        }

        const { canvas: shirtCanvas, context: shirtContext } = createCanvas(
            BODY_WIDTH,
            BODY_HEIGHT
        );

        const { shirtIndex } = shirts[this.shirtIndex];

        shirtContext.drawImage(
            this.game.images['/character/shirts.png'],
            angle * BODY_WIDTH,
            shirtIndex * BODY_HEIGHT,
            BODY_WIDTH,
            BODY_HEIGHT,
            0,
            0,
            BODY_WIDTH,
            BODY_HEIGHT
        );

        colourizeImage(shirtCanvas, this.shirtColour);

        bodyContext.drawImage(shirtCanvas, 0, 0);
    }

    drawArms(bodyContext, angle, index) {
        for (const {
            index: armIndex,
            x: offsetX,
            y: offsetY,
            rotate
        } of ARM_OFFSETS[index][angle]) {
            const { canvas: armCanvas, context: armContext } = createCanvas(
                ARM_SIZE,
                ARM_SIZE
            );

            if (rotate) {
                armContext.translate(ARM_SIZE, 0);
                armContext.scale(-1, 1);
            }

            armContext.drawImage(
                this.game.images['/character/arms.png'],
                0,
                armIndex * ARM_SIZE,
                ARM_SIZE,
                ARM_SIZE,
                0,
                0,
                ARM_SIZE,
                ARM_SIZE
            );

            // skin tone
            armContext.fillStyle = '#000';
            armContext.globalCompositeOperation = 'source-atop';
            armContext.globalAlpha = this.skinTone;

            armContext.fillRect(0, 0, ARM_SIZE, ARM_SIZE);

            armContext.globalCompositeOperation = 'source-over';
            armContext.globalAlpha = 1;

            bodyContext.drawImage(
                armCanvas,
                0,
                0,
                ARM_SIZE,
                ARM_SIZE,
                offsetX,
                offsetY,
                ARM_SIZE,
                ARM_SIZE
            );

            if (this.shirtIndex === -1) {
                return;
            }

            const { sleeveIndex } = shirts[this.shirtIndex];

            const {
                canvas: sleeveCanvas,
                context: sleeveContext
            } = createCanvas(ARM_SIZE, ARM_SIZE);

            if (rotate) {
                sleeveContext.translate(ARM_SIZE, 0);
                sleeveContext.scale(-1, 1);
            }

            if (sleeveIndex !== -1) {
                sleeveContext.drawImage(
                    this.game.images['/character/sleeves.png'],
                    sleeveIndex * ARM_SIZE,
                    armIndex * ARM_SIZE,
                    ARM_SIZE,
                    ARM_SIZE,
                    0,
                    0,
                    ARM_SIZE,
                    ARM_SIZE
                );

                colourizeImage(sleeveCanvas, this.shirtColour);
            }

            bodyContext.drawImage(
                sleeveCanvas,
                0,
                0,
                ARM_SIZE,
                ARM_SIZE,
                offsetX,
                offsetY,
                ARM_SIZE,
                ARM_SIZE
            );
        }
    }

    generateBodySprite(angle, index) {
        // base canvas
        const { canvas: bodySprite, context: bodyContext } = createCanvas(
            BODY_WIDTH,
            BODY_HEIGHT + 10
        );

        bodyContext.drawImage(
            this.game.images['/character/bodies.png'],
            angle * BODY_WIDTH,
            (this.isFemale ? BODY_COUNT * BODY_HEIGHT : 0) +
                index * BODY_HEIGHT,
            BODY_WIDTH,
            BODY_HEIGHT,
            0,
            0,
            BODY_WIDTH,
            BODY_HEIGHT
        );

        // skin tone
        bodyContext.fillStyle = '#000';
        bodyContext.globalCompositeOperation = 'source-atop';
        bodyContext.globalAlpha = this.skinTone;

        bodyContext.fillRect(0, 0, BODY_WIDTH, BODY_HEIGHT);

        bodyContext.globalCompositeOperation = 'source-over';
        bodyContext.globalAlpha = 1;

        // shoes
        if (this.shoesIndex !== -1) {
            const { canvas: shoesCanvas, context: shoesContext } = createCanvas(
                70,
                78
            );

            shoesContext.drawImage(
                this.game.images['/character/shoes.png'],
                angle * 70,
                this.shoesIndex * 78 * BODY_COUNT + index * 78,
                70,
                78,
                0,
                0,
                70,
                78
            );

            colourizeImage(shoesCanvas, this.shoesColour);

            bodyContext.drawImage(shoesCanvas, 0, 0);
        }

        // pants
        if (this.pantsIndex !== -1) {
            const { canvas: pantsCanvas, context: pantsContext } = createCanvas(
                BODY_WIDTH,
                BODY_HEIGHT
            );

            pantsContext.drawImage(
                this.game.images['/character/pants.png'],
                angle * BODY_WIDTH,
                this.pantsIndex * BODY_HEIGHT * 6 + index * BODY_HEIGHT,
                BODY_WIDTH,
                BODY_HEIGHT,
                0,
                0,
                BODY_WIDTH,
                BODY_HEIGHT
            );

            colourizeImage(pantsCanvas, this.pantsColour);

            bodyContext.drawImage(pantsCanvas, 0, 0);
        }

        if (angle === 2 && (index === 0 || index === 1)) {
            this.drawArms(bodyContext, angle, index);
            this.drawShirt(bodyContext, angle);
        } else {
            this.drawShirt(bodyContext, angle);
            this.drawArms(bodyContext, angle, index);
        }

        return bodySprite;
    }

    generateSprites() {
        // ne, e, se, s, n, [sw, w nw] <- autogenerated
        this.sprites = {
            idle: [],
            sit: [], // only ne and se
            walk0: [],
            walk1: [],
            walk2: [],
            walk3: []
        };

        for (let bodyIndex = 0; bodyIndex < BODY_COUNT; bodyIndex += 1) {
            const spriteName = BODY_INDEX_SPRITE_NAMES[bodyIndex];

            for (let angle = 0; angle < 5; angle += 1) {
                const {
                    canvas: baseSprite,
                    context: baseContext
                } = createCanvas(82, 136);

                // TODO stop cutting

                const bodySprite = this.generateBodySprite(angle, bodyIndex);
                const headSprite = this.generateHeadSprite(angle);

                baseContext.drawImage(
                    bodySprite,
                    BODY_ANGLE_OFFSETS[angle].x,
                    BODY_ANGLE_OFFSETS[angle].y
                );

                baseContext.drawImage(headSprite, 0, 0);

                this.sprites[spriteName].push(baseSprite);
            }

            for (let angle = 5; angle < 8; angle += 1) {
                const {
                    canvas: baseSprite,
                    context: baseContext
                } = createCanvas(62, 136);

                baseContext.translate(baseSprite.width, 0);
                baseContext.scale(-1, 1);

                baseContext.drawImage(
                    this.sprites[spriteName][angle - 5],
                    ROTATED_OFFSETS[angle - 5],
                    0
                );

                this.sprites[spriteName].push(baseSprite);
            }
        }

        this.image = this.sprites.idle[3];
    }

    updateAppearance(data) {
        this.headIndex = 0;
        this.eyeIndex = 5;
        this.eyeSubIndex = 0;
        this.faceIndex = 2;
        this.faceSubIndex = 0;
        this.hairIndex = data.hairIndex;
        this.eyeIndex = 1;
        this.eyeSubIndex = 0;
        this.hatIndex = -1;
        //this.bodyIndex = 0;
        this.shirtIndex = data.shirtIndex;
        this.pantsIndex = data.pantsIndex;
        this.shoesIndex = data.shoesIndex;
        this.skinTone = (data.skinTone / 10) * 0.75;

        this.hairColour = intToRGB(data.hairColour);
        //this.eyeColour = '#ffffff';
        this.shirtColour = intToRGB(data.shirtColour);
        this.pantsColour = intToRGB(data.pantsColour);
        this.shoesColour = intToRGB(data.shoesColour);
        //this.hatColour = cssColor('#ff0000');

        this.generateSprites();
    }

    // move the character to their absolute position and reset the draw offset
    // (used in animation)
    resetDrawOffset() {
        if (this.room.drawableGrid[this.y][this.x] === this) {
            this.room.drawableGrid[this.y][this.x] = null;
        }

        this.x = this.toX;
        this.y = this.toY;

        if (!this.room.drawableGrid[this.y][this.x]) {
            this.room.drawableGrid[this.y][this.x] = this;
        }

        this.drawOffsetX = 0;
        this.drawOffsetY = 0;

        this.toX = -1;
        this.toY = -1;
    }

    move(x, y) {
        if (this.sitting) {
            this.sitting.sitters.delete(this);
            this.sitting = null;

            this.isSitting = false;
            this.toX = x;
            this.toY = y;

            this.resetDrawOffset();
            return;
        }

        if (this.idleStepTimeout) {
            clearTimeout(this.idleStepTimeout);
        }

        if (this.toX !== -1 || this.toY !== -1) {
            this.resetDrawOffset();
        }

        const deltaX = this.x - x;
        const deltaY = this.y - y;

        this.angle = WALK_ANGLE_DELTAS[deltaX][deltaY];

        this.toX = x;
        this.toY = y;

        const { x: drawX, y: drawY } = this.room.isoToCoordinate(x, y);

        this.toDrawX = drawX;
        this.toDrawY = drawY - DRAW_OFFSET_Y;

        const diffX = this.toDrawX - this.drawX;
        const diffY = this.toDrawY - this.drawY;
        const distance = Math.sqrt(diffX * diffX + diffY * diffY);
        const isDiagonal = Math.abs(deltaX) === 1 && Math.abs(deltaY) === 1;
        const stepTime = isDiagonal ? 750 : 500;

        this.idleStepTimeout = setTimeout(() => {
            this.walkIndex = -1;
        }, stepTime + this.game.frameMs);

        const totalFrames = stepTime / this.game.frameMs;

        this.walkIndex = 0; // which walk sprite index we're at

        this.walkFrameCount = 0; // 0 - this.totalWalkFrames

        // how many frames until we switch sprites
        this.totalWalkFrames = Math.ceil(totalFrames / 4);

        this.walkSpeed = distance / totalFrames; // px per frame

        this.startWalkTime = Date.now();

        this.toDrawDeltaX = diffX / distance;
        this.toDrawDeltaY = diffY / distance;

        this.drawOffsetX = 0;
        this.drawOffsetY = 0;
    }

    update() {
        if (this.isSitting) {
            this.image = this.sprites.sit[this.angle];

            let { x: drawX, y: drawY } = this.room.isoToCoordinate(
                this.x,
                this.y
            );

            drawY = drawY - DRAW_OFFSET_Y;

            this.drawX = drawX;
            this.drawY = drawY;
            return;
        }

        let sprites;

        if (this.walkIndex !== -1) {
            sprites = this.sprites[`walk${this.walkIndex}`];

            this.walkFrameCount += 1;

            if (this.walkFrameCount >= this.totalWalkFrames) {
                this.walkFrameCount = 0;
                this.walkIndex = (this.walkIndex + 1) % 4;
            }
        } else {
            sprites = this.sprites.idle;
        }

        this.image = sprites[this.angle];

        let { x: drawX, y: drawY } = this.room.isoToCoordinate(this.x, this.y);

        drawY = drawY - DRAW_OFFSET_Y;

        let destX = drawX;
        let destY = drawY;

        if (this.toX !== -1 || this.toY !== -1) {
            this.drawOffsetX += this.toDrawDeltaX * this.walkSpeed;
            destX += this.drawOffsetX;

            this.drawOffsetY += this.toDrawDeltaY * this.walkSpeed;
            destY += this.drawOffsetY;

            if (
                (this.toDrawDeltaX > 0 && destX > this.toDrawX) ||
                (this.toDrawDeltaX < 0 && destX < this.toDrawX)
            ) {
                destX = this.toDrawX;
            }

            if (
                (this.toDrawDeltaY > 0 && destY > this.toDrawY) ||
                (this.toDrawDeltaY < 0 && destY < this.toDrawY)
            ) {
                destY = this.toDrawY;
            }

            const diffX = this.toDrawX - destX;
            const diffY = this.toDrawY - destY;

            const distance = Math.sqrt(diffX * diffX + diffY * diffY);

            if (Math.floor(distance) === 0) {
                this.resetDrawOffset();
                this.update();
                // TODO we can probably do something a bit smoother here

                return;
            }
        }

        this.drawX = drawX + this.drawOffsetX;
        this.drawY = drawY + this.drawOffsetY;
    }

    draw() {
        const { context } = this.game;

        if (!this.isSitting) {
            context.drawImage(
                this.game.images['/character/shadow.png'],
                this.drawX,
                this.drawY + DRAW_OFFSET_Y
            );
        }

        context.drawImage(this.image, this.drawX, this.drawY);
    }
}

module.exports = Character;
