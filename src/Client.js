'use strict'

const connection = require('./e4kserver/connection');
const e4kData = require('./e4kserver/data');
const AllianceManager = require('./managers/AllianceManager');
const MovementManager = require('./managers/MovementManager');
const PlayerManager = require('./managers/PlayerManager');
const WorldmapManager = require('./managers/WorldmapManager');
const { WaitUntil } = require('./tools/wait');
const EventEmitter = require('node:events');

class Client extends EventEmitter {
    /** @type {string} */
    #name = "";
    /** @type {string} */
    #password = "";
    /** @type {Socket} */
    _socket = new (require("net").Socket)();
    /**
     * 
     * @param {string} name 
     * @param {string} password 
     * @param {number} reconnectTimeoutInSeconds 
     * @param {boolean} debug 
     */
    constructor(name, password, reconnectTimeoutInSeconds = 300, debug = false) {
        super();
        if (name !== "" && password !== "") {
            this.#name = name;
            this.#password = password;
            this._socket = new (require("net").Socket)();
            /**
             * @type {MovementManager}
             */
            this.movements = new MovementManager(this);
            /**
             * @type {AllianceManager}
             */
            this.alliances = new AllianceManager(this);
            /**
             * @type {PlayerManager}
             */
            this.players = new PlayerManager(this);
            /**
             * @type {WorldmapManager}
             */
            this.worldmaps = new WorldmapManager(this);
            this._socket["debug"] = debug;
            this._socket["client"] = this;
            this._socket["__reconnTimeoutSec"] = reconnectTimeoutInSeconds;
            addSocketListeners(this._socket);
        }
    }
    /**
     * 
     * @returns {Promise<Client>}
     */
    connect() {
        return new Promise(async (resolve, reject) => {
            try {
                if (this._socket["__connected"]) resolve(this);
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
    /**
     * 
     * @param {string} message 
     */
    sendChatMessage(message) {
        require('./e4kserver/commands/sendAllianceChatMessageCommand').execute(this._socket, message);
    }
    /**
     * 
     * @param {InteractiveMapobject} worldmapArea
     * @returns {Promise<any>}
     */
    getCastleInfo(worldmapArea) {
        return new Promise(async (resolve, reject) => {
            try {
                if (!worldmapArea || !worldmapArea.objectId) reject("WorldmapArea is not valid");
                require('./e4kserver/commands/joinAreaCommand').execute(this._socket, worldmapArea);
                await WaitUntil(this._socket, `join_area_${worldmapArea.objectId}_finished`);
                resolve(this._socket[`join_area_${worldmapArea.objectId}_data`]);
            }
            catch (e) {
                reject(e);
            }
        })
    }
    /**
     * @param {number} val
     */
    set reconnectTimeout(val) {
        this._socket["__reconnTimeoutSec"] = val;
    }
    /**
     * @returns {Promise<void>}
     */
    __x__x__relogin() {
        return new Promise(async (resolve, reject) => {
            try {
                await _disconnect(this._socket);
                await this.connect();
                resolve();
            }
            catch (e) {
                reject(e);
            }
        })
    }
}

/**
 * 
 * @param {Socket} socket
 * @returns {Promise<void>}
 */
function _connect(socket) {
    return new Promise(async (resolve, reject) => {
        try {
            connection.connect(socket);
            await WaitUntil(socket, "__connected", "__connection_error");
            socket["reconnecting"] = false;
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
 * @returns {Promise<void>}
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

/**
 * 
 * @param {Socket} socket
 */
function addSocketListeners(socket) {
    socket.addListener("error", (err) => {
        console.log("\x1b[31m[SOCKET ERROR] " + err + "\x1b[0m");
        socket.end(() => { });
    });
    socket.addListener('data', (data) => { e4kData.onData(socket, data); });
    socket.addListener('end', () => {
        if (socket["debug"])
            console.log("Socket Ended!");
        socket["__connected"] = false;
        socket["__disconnect"] = true;
    });
    socket.addListener('timeout', () => {
        if (socket["debug"])
            console.log("Socket Timeout!");
        socket.end(() => { });
    });
    socket.addListener('close', hadError => {
        if (socket["debug"])
            console.log("Socket Closed!" + (hadError ? " Caused by error!" : ""));
        socket["__connected"] = false;
        if (!socket["reconnecting"]) {
            socket["reconnecting"] = true;
            setTimeout(() => (socket.client.connect()), socket["__reconnTimeoutSec"] * 1000);
        }
    });
    socket.addListener('ready', () => { connection._sendVersionCheck(socket); });
}

/** 
 * @param {Socket} socket 
 * @returns {Promise<void>}
*/
function _disconnect(socket) {
    return new Promise(async (resolve, reject) => {
        try {
            socket["__disconnect"] = false;
            socket.end();
            await WaitUntil(socket, "__disconnect");
            resolve();
        }
        catch (e) {
            reject(e);
        }
    })
}

module.exports = Client;