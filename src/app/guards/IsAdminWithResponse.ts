import {GuardFunction} from "@typeit/discord";
import {MessageEmbed} from "discord.js";
import {ERROR_COLOR} from "../utils/constants";
import {isModBasedOnMessage} from "../utils/Functions";

/**
 * Checks if the user that sent the message is an admin. This is done by fetching the guild with ID, and then fetching the user in the guild using his user id
 * This will give us access to his permissions bitfield. We can determine if the user has an permission by doing bitwise operations.
 * @see https://discord.com/developers/docs/topics/permissions
 * @param message
 * @param client
 * @param next
 * @constructor
 */
export const IsAdminWithResponse: GuardFunction<"message"> = async (
    [message],
    client,
    next
) => {
    const isMod = isModBasedOnMessage(message)
    if (isMod) {
        await next();
    } else {
        const response = new MessageEmbed();
        response.setTitle("Permission denied!")
            .setColor(ERROR_COLOR)
            .setDescription("You are not authorized to execute this command!");
        await message.channel.send(response);
    }
}
