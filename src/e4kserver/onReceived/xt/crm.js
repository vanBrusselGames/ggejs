const { execute: gam } = require('./gam');

module.exports = {
    name: "crm",
    /**
     * @param {Socket} socket
     * @param {number} errorCode
     * @param {object} params
     */
    execute(socket, errorCode, params) {
        if(!params) return;
        gam(socket, 0, { M: [params.A] });
    }
}