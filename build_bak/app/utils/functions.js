"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.constrain = exports.CREATE_DEFAULT_EMBED = exports.CREATE_ERROR_EMBED = exports.getUserId = exports.isModBasedOnMessage = void 0;
const constants_1 = require("./constants");
const discord_js_1 = require("discord.js");
function isModBasedOnMessage(message) {
    const guildMember = message.guild.members.cache.get(message.author.id);
    const permissions = guildMember.permissions.bitfield;
    const permissionToCheck = discord_js_1.Permissions.FLAGS.BAN_MEMBERS;
    return (permissions & permissionToCheck) === permissionToCheck;
}
exports.isModBasedOnMessage = isModBasedOnMessage;
/**
 * Filter out the <@! and > in the strings, leaving only numbers (userid). Join them from one array into a string
 * @param garbledUserId - The garbled userid to format
 */
function getUserId(garbledUserId) {
    try {
        return garbledUserId.match(/\d/g).join("");
    }
    catch (e) {
        constants_1.LOGGER.error(`${e.message} || ${e.stack}`);
        return undefined;
    }
}
exports.getUserId = getUserId;
const CREATE_ERROR_EMBED = (title, message) => {
    return new discord_js_1.MessageEmbed().setTitle(title).setDescription(message).setColor(constants_1.ERROR_COLOR);
};
exports.CREATE_ERROR_EMBED = CREATE_ERROR_EMBED;
const CREATE_DEFAULT_EMBED = (title, message) => {
    return new discord_js_1.MessageEmbed().setTitle(title).setDescription(message).setColor(constants_1.DEFAULT_COLOR);
};
exports.CREATE_DEFAULT_EMBED = CREATE_DEFAULT_EMBED;
const constrain = (num, min, max) => {
    const MIN = min || 1;
    const MAX = max || 20;
    return Math.min(Math.max(num, MIN), MAX);
};
exports.constrain = constrain;
//# sourceMappingURL=functions.js.map