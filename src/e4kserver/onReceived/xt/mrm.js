module.exports = {
    name: "mrm",
    /**
     * @param {Socket} socket
     * @param {number} errorCode
     * @param {object} params
     */
    execute(socket, errorCode, params) {
        socket.client.movements._remove(params.MID);
    }
}