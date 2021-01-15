import {GuardFunction} from "@typeit/discord";
import {GuildMember, MessageEmbed, Permissions} from "discord.js";
import {ERROR_COLOR} from "../constants";

/**
 * Checks if the user that sent the message is an admin. This is done by fetching the guild with ID, and then fetching the user in the guild using his user id
 * This will give us access to his permissions bitfield. We can determine if the user has an permission by doing bitwise operations.
 * @see https://discord.com/developers/docs/topics/permissions
 * @param message
 * @param client
 * @param next
 * @constructor
 */
export const IsAdmin: GuardFunction<"message"> = async (
    [message],
    client,
    next
) => {
    const guild = await client.guilds.fetch(process.env.GUILD_TOKEN)
    const guildMember = await guild.members.fetch({user: message.author.id});
    const permissions = guildMember.permissions.bitfield;
    const permissionToCheck = Permissions.FLAGS.BAN_MEMBERS;

    const isMod = (permissions & permissionToCheck) === permissionToCheck;
    if (isMod) {
        await next();
    } else{
        const response = new MessageEmbed();
        response.setTitle("Permission denied!")
            .setColor(ERROR_COLOR)
            .setDescription("You are not authorized to execute this command!");
        message.channel.send(response);
    }
}
