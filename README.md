# ggejs
A powerful [Node.js](https://nodejs.org) module for interacting with the server of [Goodgame Empire: Four Kingdoms](https://play.google.com/store/apps/details?id=air.com.goodgamestudios.empirefourkingdoms)

## Installation
```sh-session
npm install ggejs
```

## Example usage
```js
const { Client, Constants } = require('empirejs');
const networkInstances = require('e4k-data').network.instances.instance;
const worldNetworkInstance = networkInstances.find(i => i.instanceLocaId === "generic_country_world");

const client = new Client('username', 'password', worldNetworkInstance);


client.on('connected', () => {
    console.log("Client connected!");
});

client.connect();
```

## Links
- [GitHub](https://github.com/vanBrusselGames/ggejs)
- [npm](https://www.npmjs.com/package/ggejs)
