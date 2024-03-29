const {dungeons} = require('e4k-data').data;
const BasicMapobject = require("./BasicMapobject");
const Unit = require("../Unit");
const Lord = require("../Lord");

class DungeonMapobject extends BasicMapobject {
    #client;
    /** @type {object} */
    _rawData = null;

    /**
     *
     * @param {Client} client
     * @param {Array} data
     */
    constructor(client, data) {
        super(client, data);
        this.#client = client;
        if (data[3] > 0) /** @type {Date} */
        this.lastSpyDate = new Date(Date.now() - data[3] * 1000);
        /** @type {number} */
        this.attackCount = data[4];
        if (data[5] > 0) /** @type {Date} */
        this.attackCooldownEnd = new Date(Date.now() + data[5] * 1000);
        /** @type {number} */
        this.kingdomId = data[6];
        /** @type {number} */
        this.level = Math.floor(1.9 * Math.pow(Math.abs(this.attackCount), 0.555)) + getKingdomOffset(this.kingdomId);
        /** @type {number} */
        this.resources = Math.floor(Math.pow(this.level, 2.2) * 1.2 + 90);
        /** @type {number} */
        this.coins = this.level >= 61 ? Math.floor(Math.pow(this.level, 1.1) * 210) : Math.round(Math.pow(this.level, 2.1) * 3.5 + 25);
        /** @type {number} */
        this.rubies = this.level < 3 ? 0 : Math.floor(Math.max(0, (Math.random() * 11 - 5 + this.level * 0.5 + 0.7) * 0.5));
        /** @type {number} */
        this.rubyProbability = this.level >= 3 ? 0.5 : 0;
        /** @type {number} */
        this.wallWodId = this.level < 11 ? 501 : this.level < 24 ? 502 : 503;
        /** @type {number} */
        this.gateWodId = this.level < 11 ? 450 : this.level < 24 ? 451 : 452;
        /** @type {number} */
        this.guards = Math.max(0, Math.min(50, Math.round(0.06 * (this.level - 4) * (this.level - 4) + 0.5 * (this.level - 4))));
        /** @type {number} */
        this.xp = Math.round(Math.max(1, Math.pow(0.5 * this.level, 1.1)));
    }

    /**
     * @returns {{ troops: { left: InventoryItem<Unit>[], middle: InventoryItem<Unit>[], right: InventoryItem<Unit>[], center: InventoryItem<Unit>[] }, tools: { left: InventoryItem<Tool>[], middle: InventoryItem<Tool>[], right: InventoryItem<Tool>[] } }}
     */
    get defence() {
        if (this._defence) return this._defence;
        if (this._rawData === null) {
            for (const _dungeon of dungeons) {
                if (_dungeon.countVictories === this.attackCount && _dungeon.kID === this.kingdomId) {
                    this._rawData = _dungeon;
                }
            }
        }
        /** @type {{ troops: { left: InventoryItem<Unit>[], middle: InventoryItem<Unit>[], right: InventoryItem<Unit>[], center: InventoryItem<Unit>[] }, tools: { left: InventoryItem<Tool>[], middle: InventoryItem<Tool>[], right: InventoryItem<Tool>[] } }} */
        this._defence = {
            troops: {
                left: parseUnits(this.#client, this._rawData.unitsL),
                middle: parseUnits(this.#client, this._rawData.unitsM),
                right: parseUnits(this.#client, this._rawData.unitsR),
                center: parseUnits(this.#client, this._rawData.unitsK),
            }, tools: {
                left: parseUnits(this.#client, this._rawData.toolL),
                middle: parseUnits(this.#client, this._rawData.toolM),
                right: parseUnits(this.#client, this._rawData.toolR)
            }
        }
        return this._defence;
    }

    /** @returns {Lord} */
    get lord() {
        if (this._lord) return this._lord;
        if (this._rawData === null) {
            for (let k in dungeons) {
                let _dungeon = dungeons[k];
                if (_dungeon.countVictories === this.attackCount && _dungeon.kID === this.kingdomId) {
                    this._rawData = _dungeon;
                }
            }
        }
        /** @type {Lord} */
        this._lord = new Lord(this.#client, {DLID: parseInt(this._rawData.lordID)});
        return this._lord;
    }

    parseAreaInfoBattleLog(data) {
        super.parseAreaInfoBattleLog(data);
        this.level = data["DL"];
        return this;
    }
}

/**
 *
 * @param {Client} client
 * @param {string} _data
 * @returns {InventoryItem<Unit>[]}
 */
function parseUnits(client, _data) {
    /** @type {InventoryItem<Unit>[]} */
    let units = [];
    if (!_data) return units;
    let data = _data.split("#");
    for (let _ of data) {
        let wodId_count = _.split("+");
        units.push({
            item: new Unit(client, parseInt(wodId_count[0])), count: parseInt(wodId_count[1])
        })
    }
    return units;
}

/**
 *
 * @param {0 | 2 | 1 | 3} kingdomId
 * @returns {1 | 20 | 35 | 45}
 */
function getKingdomOffset(kingdomId) {
    switch (kingdomId) {
        case 0:
            return 1;
        case 2:
            return 20;
        case 1:
            return 35;
        case 3:
            return 45;
    }
}

module.exports = DungeonMapobject;