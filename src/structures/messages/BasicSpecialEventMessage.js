const BasicMessage = require("./BasicMessage");
const Localize = require("../../tools/Localize");
class BasicSpecialEventMessage extends BasicMessage {
    parseMetaData(client, metaArray)
    {
        this.subType = parseInt(metaArray[0]);
        this.senderName = Localize.text(client, "dialog_messages_system");
    }
}

module.exports = BasicSpecialEventMessage;