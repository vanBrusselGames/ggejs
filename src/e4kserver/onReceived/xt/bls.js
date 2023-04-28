const Player = require("../../../structures/Player");
const ShapeshifterMapobject = require("../../../structures/ShapeshifterMapobject");
const NomadKhanInvasionMapobject = require("../../../structures/NomadKhanInvasionMapobject");
const RedAlienInvasionMapobject = require("../../../structures/RedAlienInvasionMapobject");
const DynamicMapobject = require("../../../structures/DynamicMapobject");
const NomadInvasionMapobject = require("../../../structures/NomadInvasionMapobject");
const MonumentMapobject = require("../../../structures/MonumentMapobject");
const DungeonIsleMapobject = require("../../../structures/DungeonIsleMapobject");
const ResourceIsleMapobject = require("../../../structures/ResourceIsleMapobject");
const KingstowerMapobject = require("../../../structures/KingstowerMapobject");
const CapitalMapobject = require("../../../structures/CapitalMapobject");
const AlienInvasionMapobject = require("../../../structures/AlienInvasionMapobject");
const EventDungeonMapobject = require("../../../structures/EventDungeonMapobject");
const CastleMapobject = require("../../../structures/CastleMapobject");
const BossDungeonMapobject = require("../../../structures/BossDungeonMapobject");
const VillageMapobject = require("../../../structures/VillageMapobject");
const DungeonMapobject = require("../../../structures/DungeonMapobject");
const EmptyMapobject = require("../../../structures/EmptyMapobject");
const Equipment = require("../../../structures/Equipment");
const RelicEquipment = require("../../../structures/RelicEquipment");
const Gem = require("../../../structures/Gem");
const BattleParticipant = require("../../../structures/BattleParticipant");
const Lord = require("../../../structures/Lord");
const General = require("../../../structures/General");
const minutesSkips = require('e4k-data').data.currencyMinutesSkipValues;

module.exports = {
    name: "bls", /**
     * @param {Socket} socket
     * @param {number} errorCode
     * @param {object} params
     */
    execute(socket, errorCode, params) {
        if (!params) return;
        const _client = socket.client;
        /** @type {Player[]} */
        let players = [];
        for (let p of params["PI"]) {
            players.push(new Player(_client, {O: p}));
        }
        const pbiInfo = parsePBIinfo(_client, params["PBI"], params);
        const isDefenseReport = socket[`${params.MID} battleLogMessage`]?.isDefenseReport;
        const attackerLords = parseAttackerLords(socket.client, params, {attacker: pbiInfo.attacker});
        const defenderLords = parseDefenderLords(socket.client, params, {defender: pbiInfo.defender});
        socket[`bls -> ${params.MID}`] = {
            battleLogId: params["LID"],
            messageId: params["MID"],
            messageType: params["MT"],
            mapobject: parseWorldmapArea(_client, params["AI"]),
            attacker: pbiInfo.attacker,
            defender: pbiInfo.defender,
            winner: pbiInfo.winner,
            loser: pbiInfo.loser,
            players: players,
            defWon: params["DW"],
            honor: params["H"],
            survivalRate: params["SR"],
            ragePoints: params["RP"],
            shapeshifterPoints: params["SSP"],
            shapeshifterId: params["SSID"],
            rewardEquipment: params["EQF"] == null ? null : params["EQF"][11] === 3 ? new RelicEquipment(_client, params["EQF"]) : new Equipment(_client, params["EQF"]),
            rewardGemId: params["GF"] == null ? null : new Gem(_client, params["GF"]),
            rewardMinuteSkips: params["MSF"] == null ? null : minutesSkips.find(ms => ms.MinuteSkipIndex === params["MSF"] - 1),
            attackerHomeCastleId: params["AHC"],
            attackerHadHospital: params["AHH"] === 1,
            isAttackerHospitalFull: params["AHF"] === 1,
            defenderHomeCastleId: params["DHC"],
            defenderHadHospital: params["DHH"] === 1,
            isDefenderHospitalFull: params["DHF"] === 1,
            attackerAllianceSubscribers: params["AAS"],
            defenderAllianceSubscribers: params["DAS"],
            attackerHasIndividualSubscription: params["AHP"] === 1,
            defenderHasIndividualSubscription: params["DHP"] === 1,
            isTempServerChargeAttack: params["CRO"] === 1,
            winnerChargeRankOld: isDefenseReport ? params["DCRO"] : params["CRO"],
            winnerChargeRankNew: isDefenseReport ? params["DCRN"] : params["CRN"],
            winnerChargePointsOld: isDefenseReport ? params["DCPO"] : params["CPO"],
            winnerChargePointsNew: isDefenseReport ? params["DCPN"] : params["CPN"],
            allianceName: params["N"],
            attackerCommandant: attackerLords?.commandant,
            attackerGeneral: attackerLords?.general,
            attackerLegendSkills: attackerLords?.legendSkills,
            defenderBaron: defenderLords?.baron,
            defenderGeneral: defenderLords?.general,
            defenderLegendSkills: defenderLords?.legendSkills,
        };
    }
}


/**
 *
 * @param {Client} client
 * @param {Object} data
 * @returns {Mapobject}
 */
function parseWorldmapArea(client, data) {
    switch (data["AT"]) {
        case 0:
            return new EmptyMapobject(client, []).parseAreaInfoBattleLog(data);
        case 1:
            return new CastleMapobject(client, []).parseAreaInfoBattleLog(data);
        case 2:
            return new DungeonMapobject(client, []).parseAreaInfoBattleLog(data);
        case 3:
            return new CapitalMapobject(client, []).parseAreaInfoBattleLog(data);
        case 4:
            return new CastleMapobject(client, []).parseAreaInfoBattleLog(data);
        case 10:
            return new VillageMapobject(client, []).parseAreaInfoBattleLog(data);
        case 11:
            return new BossDungeonMapobject(client, []).parseAreaInfoBattleLog(data);
        case 12:
            return new CastleMapobject(client, []).parseAreaInfoBattleLog(data);
        case 13:
            return new EventDungeonMapobject(client, []).parseAreaInfoBattleLog(data);
        case 21:
            return new AlienInvasionMapobject(client, []).parseAreaInfoBattleLog(data);
        case 22:
            return new CapitalMapobject(client, []).parseAreaInfoBattleLog(data);
        case 23:
            return new KingstowerMapobject(client, []).parseAreaInfoBattleLog(data);
        case 24:
            return new ResourceIsleMapobject(client, []).parseAreaInfoBattleLog(data);
        case 25:
            return new DungeonIsleMapobject(client, []).parseAreaInfoBattleLog(data);
        case 26:
            return new MonumentMapobject(client, []).parseAreaInfoBattleLog(data);
        case 27:
            return new NomadInvasionMapobject(client, []).parseAreaInfoBattleLog(data);
        case 31:
            return new DynamicMapobject(client, []).parseAreaInfoBattleLog(data);
        case 34:
            return new RedAlienInvasionMapobject(client, []).parseAreaInfoBattleLog(data);
        case 35:
            return new NomadKhanInvasionMapobject(client, []).parseAreaInfoBattleLog(data);
        case 36:
            return new ShapeshifterMapobject(client, []).parseAreaInfoBattleLog(data);
        default:
            console.log(`Current mapobject (areatype ${data[0]}) isn't fully supported!`);
            console.log(data);
            break;
    }
}

/**
 *
 * @param {Client} client
 * @param {Array} data
 * @param {Object} battleLogParams
 * @return {{winner: BattleParticipant, loser: BattleParticipant, attacker: BattleParticipant, defender: BattleParticipant}}
 */
function parsePBIinfo(client, data, battleLogParams) {
    /** @type {BattleParticipant[]} */
    let players = [];
    for (let p of data) {
        players.push(new BattleParticipant(client, p))
    }
    let winnerIndex = battleLogParams["DW"] && players[0].front === 1 || !battleLogParams["DW"] && players[0].front === 0 ? 0 : 1;
    let loserIndex = 1 - winnerIndex;
    return {
        winner: players[winnerIndex], loser: players[loserIndex], attacker: players[0], defender: players[1],
    }
}


/**
 *
 * @param {Client} client
 * @param {object} data
 * @param {BattleLog} battleLog
 * @return {{commandant: Lord, general: Lord, legendSkills: int[]}}
 */
function parseAttackerLords(client, data, battleLog) {
    if (data["AL"]) {
        const lord = new Lord(client, data["AL"]);
        if (battleLog.attacker.playerId === client.players._thisPlayerId) {
            const lord2 = client.equipments.getCommandants().find(c => c.id === lord.id);
            lord.name = !!lord2 ? lord2.name : "";
        }
        let general = null;
        if (lord.generalId != null && lord.generalId !== -1) {
            general = new General(client, data["AL"]);
            lord.generalId = general.generalId;
        }
        return {
            commandant: lord, general: general, legendSkills: data["ALS"] ?? [],
        };
    }
}

/**
 *
 * @param {Client} client
 * @param {object} data
 * @param {BattleLog} battleLog
 * @return {{baron: Lord, general: Lord, legendSkills: int[]}}
 */
function parseDefenderLords(client, data, battleLog) {
    if (data["DB"]) {
        const lord = new Lord(client, data["DB"]);
        if (battleLog.defender.playerId === client.players._thisPlayerId) {
            const lord2 = client.equipments.getBarons().find(b => b.id === lord.id);
            lord.name = lord2 ? lord2.name : "";
        }
        let general = null;
        if (lord.generalId != null && lord.generalId !== -1) {
            general = new General(client, data["DB"]);
            lord.generalId = general.generalId;
        }
        return {
            baron: lord, general: general, legendSkills: data["DLS"] ?? [],
        };
    }
}