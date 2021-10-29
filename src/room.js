const Character = require('./character');
const GameObject = require('./game-object');
const Poster = require('./poster');
const Rug = require('./rug');
const rooms = require('coke-music-data/rooms.json');
const { createCanvas, cutPolygon, shadeImage } = require('./draw');

const TILE_WIDTH = 70;
const TILE_HEIGHT = 36;

class Room {
    constructor(game) {
        this.game = game;

        this.tileWidth = TILE_WIDTH;
        this.tileHeight = TILE_HEIGHT;

        this.characters = new Map();
        this.objects = new Set();
        this.rugs = new Set();
        this.posters = new Set();
        this.entities = [];

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

        // used for depth sorting
        this.drawableGrid = [];

        this.movingObject = null;

        this.boundOnMessage = this.onMessage.bind(this);
        this.boundOnTab = this.onTab.bind(this);
        this.boundOnSettings = this.onSettings.bind(this);
        this.boundOnCancel = this.onCancel.bind(this);
    }

    addCharacter(character) {
        this.drawableGrid[character.y][character.x] = character;
        this.characters.set(character.id, character);
        this.entities.push(character);
    }

    removeCharacter(character) {
        if (!character) {
            return;
        }

        character.resetDrawOffset();

        this.drawableGrid[character.y][character.x] = null;

        this.characters.delete(character.id);
        this.entities.splice(this.entities.indexOf(character), 1);
    }

    addObject(object) {
        if (object.x === -1 || object.y === -1) {
            return;
        }

        for (let y = object.y; y < object.y + object.getTileHeight(); y += 1) {
            for (
                let x = object.x;
                x < object.x + object.getTileWidth();
                x += 1
            ) {
                this.drawableGrid[y][x] = object;
            }
        }

        this.objects.add(object);
        this.entities.push(object);
    }

    removeObject(object) {
        for (let y = object.y; y < object.y + object.getTileHeight(); y += 1) {
            for (
                let x = object.x;
                x < object.x + object.getTileWidth();
                x += 1
            ) {
                this.drawableGrid[y][x] = null;
            }
        }

        this.objects.delete(object);
        this.entities.splice(this.entities.indexOf(object), 1);

        // TODO remove sitters and reset position
    }

    addRug(rug) {
        this.rugs.add(rug);
    }

    removeRug(rug) {
        this.rugs.delete(rug);
    }

    sortEntities() {
        this.entities.sort((a, b) => {
            //const depthA = a.x + a.y;
            //const depthB = b.x + b.y;

            const depthA =
                a.x +
                (a.getTileWidth ? a.getTileWidth() - 1 : 0) +
                (a.y + (a.getTileHeight ? a.getTileHeight() - 1 : 0));

            const depthB =
                b.x +
                (b.getTileWidth ? b.getTileWidth() - 1 : 0) +
                (b.y + (b.getTileHeight ? b.getTileHeight() - 1 : 0));

            if (depthA > depthB) {
                return 1;
            }

            if (depthA < depthB) {
                return -1;
            }

            if (a.y > b.y) {
                return 1;
            }

            if (a.y < b.y) {
                return -1;
            }

            if (a.x > b.x) {
                return 1;
            }

            if (a.x < b.x) {
                return -1;
            }

            return 0;
        });
    }

    moveObject(object) {
        object.edit = true;
        this.movingObject = object;
    }

    cancelMoveObject() {
        if (this.movingObject) {
            this.movingObject.edit = false;

            if (this.movingObject.oldX > -1 && this.movingObject.oldY > -1) {
                this.movingObject.x = this.movingObject.oldX;
                this.movingObject.y = this.movingObject.oldY;

                this.movingObject.oldX = -1;
                this.movingObject.oldY = -1;

                if (this.movingObject.constructor.name === 'GameObject') {
                    this.addObject(this.movingObject);
                } else if (this.movingObject.constructor.name === 'Rug') {
                    this.addRug(this.movingObject);
                }
            }
        }

        this.movingObject = null;
    }

    onMessage(message) {
        switch (message.type) {
            case 'add-character': {
                const character = new Character(this.game, this, message);
                this.addCharacter(character);
                break;
            }

            case 'remove-character': {
                if (message.id === this.game.characterID) {
                    this.game.changeState('entry');
                    return;
                }

                const character = this.characters.get(message.id);
                this.removeCharacter(character);
                break;
            }

            case 'move-character': {
                const character = this.characters.get(message.id);

                if (character) {
                    character.move(message.x, message.y);
                }

                break;
            }

            case 'character-sit': {
                const character = this.characters.get(message.id);

                if (!character) {
                    break;
                }

                if (this.drawableGrid[character.y][character.x] === character) {
                    this.drawableGrid[character.y][character.x] = null;
                }

                if (character.isSitting) {
                    character.sitting.sitters.delete(character);
                }

                character.isSitting = true;
                character.x = message.x;
                character.y = message.y;

                const tileEntity = this.drawableGrid[message.y][message.x];

                if (tileEntity) {
                    character.sitting = tileEntity;
                    tileEntity.sitters.add(character);
                }
                break;
            }

            case 'character-appearance': {
                const character = this.characters.get(message.id);

                if (character) {
                    character.updateAppearance(message);
                }
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
                    y: message.y,
                    colour: message.colour
                });

                break;
            }

            case 'add-object': {
                const object = new GameObject(this.game, this, message);
                this.addObject(object);
                break;
            }

            case 'remove-object': {
                for (const object of this.objects) {
                    if (
                        object.x === message.x &&
                        object.y === message.y &&
                        object.name === message.name
                    ) {
                        this.removeObject(object);
                        return;
                    }
                }
                break;
            }

            case 'add-rug': {
                const rug = new Rug(this.game, this, message);
                this.addRug(rug);
                break;
            }

            case 'remove-rug': {
                for (const rug of this.rugs) {
                    if (
                        rug.x === message.x &&
                        rug.y === message.y &&
                        rug.name === message.name
                    ) {
                        this.removeRug(rug);
                        return;
                    }
                }
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

    onCancel(event) {
        if (event.key === 'Escape') {
            this.cancelMoveObject();
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

    drawRugs() {
        for (const rug of this.rugs.values()) {
            rug.draw();
        }
    }

    drawPosters() {
        for (const poster of this.posters.values()) {
            poster.draw();
        }
    }

    drawWalls() {
        if (!this.wall) {
            return;
        }

        for (const [wallIndex, wallSection] of Object.entries(this.walls)) {
            const isLeft = wallSection.orientation === 'left';
            const image = isLeft ? this.wallLeftImage : this.wallRightImage;
            const deltaY = (TILE_HEIGHT / 2) * (isLeft ? -1 : 1);

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

    // prepareRoom
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

        this.drawableGrid.length = 0;

        for (let y = 0; y < this.height; y += 1) {
            this.drawableGrid.push([]);

            for (let x = 0; x < this.width; x += 1) {
                this.drawableGrid[y].push(null);
            }
        }

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
            tile,
            objects,
            rugs
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

        for (const data of characters) {
            const character = new Character(this.game, this, data);
            this.addCharacter(character);
        }

        for (const data of objects) {
            const object = new GameObject(this.game, this, data);
            this.addObject(object);
        }

        for (const { name, x, y } of rugs) {
            const rug = new Rug(this.game, this, { name });

            rug.x = x;
            rug.y = y;

            this.addRug(rug);
        }

        const poster = new Poster(this.game, this, { name: 'golden_poster', x: 0, y: 0 });

        window.poster = poster;

        this.posters.add(poster);

        this.drawRoom();

        this.roomInfoName.textContent = studio;
        this.roomInfoOwner.textContent = ownerName;

        window.addEventListener('keyup', this.boundOnCancel);

        if (this.ownerID === this.game.characterID) {
            this.settingsButton.addEventListener('click', this.boundOnSettings);

            this.settingsButton.style.display = 'inline';
        } else {
            this.settingsButton.style.display = 'none';
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

        for (const rug of this.rugs.values()) {
            rug.update();
        }

        for (const poster of this.posters.values()) {
            poster.update();
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

        if (this.movingObject) {
            this.movingObject.x = isoX;
            this.movingObject.y = isoY;

            this.movingObject.update();
        }

        const { x: tileX, y: tileY } = this.isoToCoordinate(isoX, isoY);

        this.tileIsoX = isoX;
        this.tileIsoY = isoY;
        this.tileSelectX = tileX;
        this.tileSelectY = tileY;

        if (this.game.mouseDown) {
            this.game.mouseDown = false;

            let selectedRug = false;

            for (const rug of this.rugs) {
                if (
                    isoX >= rug.x &&
                    isoX < rug.x + rug.tileWidth &&
                    isoY >= rug.y &&
                    isoY < rug.y + rug.tileHeight
                ) {
                    this.game.rugSettings.init({ object: rug });
                    selectedRug = true;
                    break;
                }
            }

            if (!selectedRug) {
                this.game.rugSettings.destroy();
            }

            const tileEntity = this.drawableGrid[isoY][isoX];

            // attempt to walk to a square with an object
            if (tileEntity && tileEntity.constructor.name === 'GameObject') {
                if (
                    this.movingObject &&
                    this.movingObject.constructor.name === 'GameObject'
                ) {
                    this.cancelMoveObject();
                }

                this.game.objectSettings.init({ object: tileEntity });

                if (!this.movingObject && !tileEntity.sit) {
                    return;
                }
            }

            // if we walk to a square that isn't a couch, destroy the settings
            if ((tileEntity && !tileEntity.sit) || !tileEntity) {
                this.game.objectSettings.destroy();
            }

            if (this.movingObject) {
                const type =
                    this.movingObject.constructor.name === 'GameObject'
                        ? 'object'
                        : 'rug';

                if (type === 'object' && this.movingObject.isBlocked()) {
                    return;
                }

                this.movingObject.edit = false;

                if (
                    this.movingObject.oldX > -1 &&
                    this.movingObject.oldY > -1
                ) {
                    this.game.write({
                        type: `pick-up-${type}`,
                        name: this.movingObject.name,
                        x: this.movingObject.oldX,
                        y: this.movingObject.oldY
                    });
                }

                this.movingObject.oldX = -1;
                this.movingObject.oldY = -1;

                const message = {
                    type: `add-${type}`,
                    name: this.movingObject.name,
                    x: this.movingObject.x,
                    y: this.movingObject.y
                };

                if (type === 'object') {
                    message.angle = this.movingObject.angle;

                    this.addObject(this.movingObject);
                } else if (type === 'rug') {
                    this.addRug(this.movingObject);
                }

                this.game.write(message);

                this.movingObject = null;
            } else {
                this.game.write({ type: 'walk', x: isoX, y: isoY });
            }
        }
    }

    draw() {
        const { context } = this.game;

        context.drawImage(
            this.roomCanvas,
            this.backgroundOffsetX,
            this.backgroundOffsetY
        );

        // don't draw entities while settings is open
        if (this.game.settings.open) {
            return;
        }

        this.drawPosters();
        this.drawRugs();

        if (this.isTileSelected()) {
            context.drawImage(
                this.tileSelectImage,
                this.tileSelectX - 2,
                this.tileSelectY - 2
            );

            if (
                this.tileIsoX === this.exit.x &&
                this.tileIsoY === this.exit.y
            ) {
                this.drawForeground();
            }
        }

        this.sortEntities();

        for (const entity of this.entities) {
            if (!entity.sitting) {
                entity.draw();
            }

            if (entity.x === this.exit.x && entity.y === this.exit.y) {
                this.drawForeground();
            }
        }

        if (this.movingObject) {
            this.movingObject.draw();
        }
    }

    destroy() {
        this.characters.clear();
        this.objects.clear();
        this.rugs.clear();
        this.posters.clear();

        this.entities.length = 0;

        this.game.navigation.destroy();
        this.game.chat.destroy();
        this.game.inventory.destroy();
        this.game.actionBar.destroy();
        this.game.settings.destroy();
        this.game.objectSettings.destroy();
        this.game.rugSettings.destroy();

        this.game.removeListener('message', this.boundOnMessage);
        window.removeEventListener('keypress', this.boundOnTab);
        this.settingsButton.removeEventListener('click', this.boundOnSettings);
        window.removeEventListener('keyup', this.boundOnCancel);

        this.roomInfo.style.display = 'none';
        this.settingsButton.style.display = 'none';
        this.statusIngame.style.display = 'none';
    }
}

module.exports = Room;
