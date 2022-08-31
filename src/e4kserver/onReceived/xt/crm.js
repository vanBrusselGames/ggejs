const { execute: gam } = require('./gam');

module.exports = {
    name: "crm",
    /**
     * 
     * @param {number} errorCode
     * @param {object} params
     */
    execute(socket, errorCode, params) {
        gam(socket, 0, { M: [params.A] });
    }
}