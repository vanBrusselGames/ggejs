'use strict'

const Socket = require('node:net').Socket;
const connection = require('./e4kserver/connection');
const AllianceManager = require('./managers/AllianceManager');
const MovementManager = require('./managers/MovementManager');
const PlayerManager = require('./managers/PlayerManager');
const WorldmapManager = require('./managers/WorldmapManager');
const { WaitUntil } = require('./tools/wait');
const EventEmitter = require('node:events');

class Client extends EventEmitter {
    #name = "";
    #password = "";
    _socket = new Socket();
    constructor(name, password, debug = false) {
        super();
        if (name !== "" && password !== "") {
            this.#name = name;
            this.#password = password;
            this._socket = new Socket();
            this.movements = new MovementManager(this);
            this.alliances = new AllianceManager(this);
            this.players = new PlayerManager(this);
            this.worldmaps = new WorldmapManager(this);
            this._socket["debug"] = debug;
            this._socket["client"] = this;
        }
    }
    connect() {
        return new Promise(async (resolve, reject) => {
            try {
                if (this._socket["__connected"]) return;
                await _connect(this._socket);
                await _login(this._socket, this.#name, this.#password);
                this.emit('connected');
                resolve(this);
            }
            catch (e) {
                reject(e);
            }
        })
    }
    sendChatMessage(message) {
        require('./e4kserver/commands/sendAllianceChatMessageCommand').execute(this._socket, message);
    }
}

/**
 * 
 * @param {Socket} socket
 */
function _connect(socket) {
    return new Promise(async (resolve, reject) => {
        try {
            connection.connect(socket);
            await WaitUntil(socket, "__connected", "__connection_error");
            resolve();
        }
        catch (e) {
            reject(e);
        }
    });
}

/**
 * 
 * @param {Socket} socket 
 * @param {string} name 
 * @param {string} password 
 * @returns 
 */
function _login(socket, name, password) {
    return new Promise(async (resolve, reject) => {
        try {
            if (name === "") reject("Missing name while logging in");
            if (password === "") reject("Missing password while logging in");
            connection.login(socket, name, password);
            await WaitUntil(socket, "__loggedIn", "__login_error");
            resolve();
        }
        catch (e) {
            reject(e);
        }
    })
}

module.exports = Client;