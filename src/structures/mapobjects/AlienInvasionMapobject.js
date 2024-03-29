const BasicMapobject = require("./BasicMapobject");

class AlienInvasionMapobject extends BasicMapobject {
    travelDistance = 50;
    eventId = 71;

    /**
     *
     * @param {Client} client
     * @param {Array} data
     */
    constructor(client, data) {
        super(client, data);
        if (data.length <= 3) return;
        /** @type {number} */
        this.dungeonLevel = data[3];
        /** @type {boolean} */
        this.hasPeaceMode = data[5] === 1;
        /** @type {number} */
        this.wallLevel = data[6];
        /** @type {number} */
        this.gateLevel = data[7];
        /** @type {number} */
        this.moatLevel = data[8];
        /** @type {boolean} */
        this.wasRerolled = data[9] === 1;
        if (data[4] > 0)
            /** @type {Date} */
            this.lastSpyDate = new Date(Date.now() - data[4] * 1000);
    }

    parseAreaInfoBattleLog(data) {
        super.parseAreaInfoBattleLog(data);
        this._dungeonLevel = data.DL;
        return this;
    }
}

module.exports = AlienInvasionMapobject;