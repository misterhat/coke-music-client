# coke-music-client

client for [Coke Music/MyCoke]https://en.wikipedia.org/wiki/MyCoke) recreation.

## install

    $ git clone https://github.com/misterhat/coke-music-client
    $ cd coke-music-client
    $ npm install
    $ npm run build-dev # or build for production
    $ npm start # or host the contents of dist/

## usage
```javascript
const Game = require('coke-music-client');

(async () => {
    const game = new Game(document.getElementById('coke-music-container'), {
        server: 'websocket server ip', // defaults to localhost
        port: 43594, // websocket port
        ssl: false // use wss://
    });

    await game.start();
})();
```

## license
Copyright 2021  Zorian Medwid

This program is free software: you can redistribute it and/or modify it under
the terms of the GNU Affero General Public License as published by the
Free Software Foundation, either version 3 of the License, or (at your option)
any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY
WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License along
with this program. If not, see http://www.gnu.org/licenses/.
