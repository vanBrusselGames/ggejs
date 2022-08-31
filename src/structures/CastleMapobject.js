const InteractiveMapobject = require("./InteractiveMapobject");

class CastleMapobject extends InteractiveMapobject {
    constructor(client, data) {
        if (data.length <= 4) {
            super(client, data.slice(0,3));
            this.occupierId = data[3];
        }
        else {
            super(client, data);
            let _externalServerInformation = data[18];
        }
    }
}

module.exports = CastleMapobject;