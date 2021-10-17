const Character = require('./character');
const GameObject = require('./game-object');
const rooms = require('coke-music-data/rooms.json');
const { createCanvas, cutPolygon, shadeImage } = require('./draw');

const TILE_WIDTH = 70;
const TILE_HEIGHT = 36;

class Room {
    constructor(game) {
        this.game = game;

        this.tileWidth = TILE_WIDTH;
        this.tileHeight = TILE_HEIGHT;

        this.objects = new Set();
        this.wallObjects = new Set();
        this.characters = new Map();

        // cartesian coordinates of where to draw tileSelectImage
        this.tileSelectX = -1;
        this.tileSelectY = -1;

        this.roomInfo = document.getElementById('coke-music-room-info');
        this.roomInfoName = document.getElementById('coke-music-studio-name');
        this.roomInfoOwner = document.getElementById('coke-music-studio-owner');

        this.settingsButton = document.getElementById(
            'coke-music-toggle-settings'
        );

        this.statusIngame = document.getElementById('coke-music-status-ingame');

        this.objects.add(
            new GameObject(this.game, this, { name: 'northern_minibar' })
        );

        this.boundOnMessage = this.onMessage.bind(this);
        this.boundOnTab = this.onTab.bind(this);
        this.boundOnSettings = this.onSettings.bind(this);
    }

    onMessage(message) {
        switch (message.type) {
            case 'add-character': {
                const character = new Character(this.game, this, {});
                character.username = message.username;
                character.x = message.x;
                character.y = message.y;
                character.id = message.id;
                this.characters.set(character.id, character);
                break;
            }
            case 'remove-character': {
                if (message.id === this.game.characterID) {
                    this.game.changeState('entry');
                    return;
                }

                this.characters.delete(message.id);
                break;
            }
            case 'move-character': {
                const character = this.characters.get(message.id);

                if (!character) {
                    break;
                }

                character.move(message.x, message.y);
                break;
            }
            case 'chat': {
                const character = this.characters.get(message.id);

                if (!character) {
                    break;
                }

                this.game.chat.addChatMessage({
                    username: character.username,
                    message: message.message,
                    x: message.x,
                    y: message.y
                });
                break;
            }
        }
    }

    onTab(event) {
        if (event.key === 'Tab') {
            event.preventDefault();
            this.game.chat.input.focus();
        }
    }

    onSettings() {
        if (this.game.settings.open) {
            this.game.settings.destroy();
        } else {
            this.game.settings.init();
        }
    }

    // convert cartesian coordinates to isometric grid position
    coordinateToIso(x, y) {
        x -= this.backgroundOffsetX + this.offsetX;
        y -= this.backgroundOffsetY + this.offsetY;

        const isoX = Math.floor(
            (y - TILE_HEIGHT / 2) / TILE_HEIGHT + x / TILE_WIDTH
        );

        const isoY = Math.floor(
            (y + TILE_HEIGHT / 2) / TILE_HEIGHT - x / TILE_WIDTH
        );

        return { isoX, isoY };
    }

    // convert isometric grid position to cartesian coordinate
    isoToCoordinate(isoX, isoY) {
        const x =
            (isoX - isoY) * TILE_HEIGHT + this.offsetX + this.backgroundOffsetX;

        const y =
            (isoX + isoY) * (TILE_HEIGHT / 2) +
            this.offsetY +
            this.backgroundOffsetY;

        return { x, y };
    }

    // are we selecting a tile with the mouse?
    isTileSelected() {
        return this.tileSelectX !== -1 && this.tileSelectY !== -1;
    }

    drawTiles() {
        if (!this.tile) {
            return;
        }

        for (let isoY = 0; isoY < this.height; isoY += 1) {
            for (let isoX = 0; isoX < this.width; isoX += 1) {
                if (this.map[isoY][isoX]) {
                    continue;
                }

                let { x, y } = this.isoToCoordinate(isoX, isoY);

                x -= this.backgroundOffsetX;
                y -= this.backgroundOffsetY;

                let drawWidth = TILE_WIDTH;

                if (this.exit.x === isoX && this.exit.y === isoY) {
                    drawWidth = drawWidth / 2;
                }

                const { canvas } = shadeImage(
                    this.tileImage,
                    this.backgroundImage,
                    x,
                    y,
                    0.5
                );

                this.roomContext.drawImage(
                    canvas,
                    0,
                    0,
                    drawWidth,
                    TILE_HEIGHT,
                    x,
                    y,
                    drawWidth,
                    TILE_HEIGHT
                );
            }
        }
    }

    drawWalls() {
        if (!this.wall) {
            return;
        }

        for (const [wallIndex, wallSection] of Object.entries(this.walls)) {
            const isLeft = wallSection.orientation === 'left';
            const image = isLeft ? this.wallLeftImage : this.wallRightImage;
            const deltaY = 18 * (isLeft ? -1 : 1);

            let drawX = wallSection.offsetX;
            let drawY = wallSection.offsetY;

            for (let i = 0; i < wallSection.width; i += 1) {
                const { context, canvas } = shadeImage(
                    image,
                    this.backgroundImage,
                    drawX,
                    drawY,
                    0.75
                );

                const isExit =
                    +wallIndex === this.exit.wall[0] && i === this.exit.wall[1];

                if (isExit) {
                    cutPolygon(context, this.exit.clip);
                }

                this.roomContext.drawImage(canvas, drawX, drawY);

                drawY += deltaY;
                drawX += TILE_HEIGHT;
            }
        }
    }

    clipForeground() {
        const { canvas, context } = createCanvas(
            this.roomCanvas.width,
            this.roomCanvas.height
        );

        const points = this.foreground;

        context.beginPath();

        context.moveTo(points[0].x, points[0].y);

        for (let i = 1; i < points.length; i += 1) {
            const { x, y } = points[i];

            context.lineTo(x, y);
        }

        context.closePath();
        context.clip();
        context.drawImage(this.roomCanvas, 0, 0);

        this.foregroundCanvas = canvas;
    }

    drawForeground() {
        this.game.context.drawImage(
            this.foregroundCanvas,
            this.backgroundOffsetX,
            this.backgroundOffsetY
        );
    }

    drawRoom() {
        this.roomContext.drawImage(this.backgroundImage, 0, 0);

        this.drawTiles();
        this.drawWalls();
        this.clipForeground();
    }

    updateRoomType() {
        Object.assign(this, rooms[this.name]);

        this.width = this.map[0].length;
        this.height = this.map.length;

        // the base background image without any custom walls or tiles applied
        this.backgroundImage = this.game.images[`/rooms/${this.name}.png`];

        // a buffered image of the background with walls and tiles applied
        this.roomCanvas = document.createElement('canvas');

        this.roomCanvas.width = this.backgroundImage.width;
        this.roomCanvas.height = this.backgroundImage.width;

        this.roomContext = this.roomCanvas.getContext('2d');

        // offsets used to centre the room image
        this.backgroundOffsetX = Math.floor(
            this.game.canvas.width / 2 - this.backgroundImage.width / 2
        );

        this.backgroundOffsetY = Math.floor(
            this.game.canvas.height / 2 - this.backgroundImage.height / 2
        );
    }

    updateTileType() {
        if (this.tile) {
            this.tileImage = this.game.images[`/tiles/${this.tile}.png`];
        }
    }

    updateWallType() {
        if (this.wall) {
            this.wallLeftImage = this.game.images[
                `/walls/${this.wall}_left.png`
            ];

            this.wallRightImage = this.game.images[
                `/walls/${this.wall}_right.png`
            ];
        }
    }

    init(properties) {
        this.game.navigation.destroy();
        this.game.chat.init();
        this.game.actionBar.init();

        this.game.mouseDown = false;

        this.characters.clear();

        const {
            id,
            ownerID,
            ownerName,
            studio,
            name,
            characters,
            wall,
            tile
        } = properties;

        this.id = id;
        this.ownerID = ownerID;
        this.ownerName = ownerName;
        this.studio = studio;

        this.name = name;
        this.updateRoomType();

        this.tile = tile;
        this.updateTileType();

        this.wall = wall;
        this.updateWallType();

        // the yellow tile-select image
        this.tileSelectImage = this.game.images['/tiles/selected.png'];

        this.game.on('message', this.boundOnMessage);
        window.addEventListener('keypress', this.boundOnTab);

        for (const { username, id, x, y } of characters) {
            const character = new Character(this.game, this, {});

            character.username = username;
            character.x = x;
            character.y = y;
            character.id = id;

            this.characters.set(id, character);
        }

        this.drawRoom();

        this.roomInfoName.textContent = studio;
        this.roomInfoOwner.textContent = ownerName;

        if (this.ownerID === this.game.characterID) {
            this.settingsButton.addEventListener('click', this.boundOnSettings);

            this.settingsButton.style.display = 'inline';
        }

        this.roomInfo.style.display = 'block';
        this.statusIngame.style.display = 'block';
    }

    update() {
        for (const character of this.characters.values()) {
            character.update();
        }

        for (const object of this.objects.values()) {
            object.update();
        }

        if (this.game.isPanelOpen()) {
            return;
        }

        const { mouseX, mouseY } = this.game;
        const { isoX, isoY } = this.coordinateToIso(mouseX, mouseY);

        // make sure the coordinate isn't off the grid or blocked
        if (
            isoX < 0 ||
            isoY < 0 ||
            isoX >= this.width ||
            isoY >= this.height ||
            this.map[isoY][isoX]
        ) {
            this.tileSelectX = -1;
            this.tileSelectY = -1;
            return;
        }

        const { x: tileX, y: tileY } = this.isoToCoordinate(isoX, isoY);

        this.tileSelectX = tileX;
        this.tileSelectY = tileY;

        if (this.game.mouseDown) {
            this.game.mouseDown = false;

            this.game.write({ type: 'walk', x: isoX, y: isoY });
        }
    }

    draw() {
        const { context } = this.game;

        context.drawImage(
            this.roomCanvas,
            this.backgroundOffsetX,
            this.backgroundOffsetY
        );

        if (this.isTileSelected()) {
            context.drawImage(
                this.tileSelectImage,
                this.tileSelectX - 2,
                this.tileSelectY - 2
            );
        }

        // don't draw entities while settings is open
        if (this.game.settings.open) {
            return;
        }

        const drawable = [
            {
                foreground: true,
                y: this.exit.y,
                draw: () => {
                    this.drawForeground();
                }
            },
            ...this.characters.values(),
            ...this.objects.values()
        ].sort((a, b) => {
            // TODO also sort by x
            const aY = a.y;
            const bY = b.toY === a.y ? b.toY : b.y;

            if (aY === bY) {
                return a.foreground ? 1 : -1;
            }

            if (aY > bY) {
                return 1;
            }

            if (aY < bY) {
                return -1;
            }

            return 0;
        });

        for (const entity of drawable) {
            entity.draw();
        }
    }

    destroy() {
        this.game.navigation.destroy();
        this.game.chat.destroy();
        this.game.inventory.destroy();
        this.game.actionBar.destroy();
        this.game.settings.destroy();

        this.game.removeListener('message', this.boundOnMessage);
        window.removeEventListener('keypress', this.boundOnTab);
        this.settingsButton.removeEventListener('click', this.boundOnSettings);

        this.roomInfo.style.display = 'none';
        this.settingsButton.style.display = 'none';
        this.statusIngame.style.display = 'none';
    }
}

module.exports = Room;
