module.exports.name = "spl";
/**
 *
 * @param {Socket} socket
 * @param {number} errorCode
 * @param {object} params
 */
module.exports.execute = function (socket, errorCode, params) {
    if(socket.debug) {
        console.log("spl:")
        console.log(params)
    }
}