"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsAdminWithResponse = void 0;
const discord_js_1 = require("discord.js");
const constants_1 = require("../utils/constants");
const functions_1 = require("../utils/functions");
/**
 * Checks if the user that sent the message is an admin. This is done by fetching the guild with ID, and then fetching the user in the guild using his user id
 * This will give us access to his permissions bitfield. We can determine if the user has an permission by doing bitwise operations.
 * @see https://discord.com/developers/docs/topics/permissions
 * @param message
 * @param client
 * @param next
 * @constructor
 */
const IsAdminWithResponse = async ([message], client, next) => {
    const isMod = functions_1.isModBasedOnMessage(message);
    if (isMod) {
        await next();
    }
    else {
        const response = new discord_js_1.MessageEmbed();
        response.setTitle("Permission denied!")
            .setColor(constants_1.ERROR_COLOR)
            .setDescription("You are not authorized to execute this command!");
        await message.channel.send(response);
    }
};
exports.IsAdminWithResponse = IsAdminWithResponse;
//# sourceMappingURL=IsAdminWithResponse.js.map