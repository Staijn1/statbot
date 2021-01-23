import {DEFAULT_COLOR, ERROR_COLOR, LOGGER} from "./constants";
import {Message, MessageEmbed, Permissions} from "discord.js";

export function isModBasedOnMessage(message: Message): boolean {
    const guildMember = message.guild.members.cache.get(message.author.id);
    const permissions = guildMember.permissions.bitfield;
    const permissionToCheck = Permissions.FLAGS.BAN_MEMBERS;

    return (permissions & permissionToCheck) === permissionToCheck;
}

/**
 * Filter out the <@! and > in the strings, leaving only numbers (userid). Join them from one array into a string
 * @param garbledUserId - The garbled userid to format
 */
export function getUserId(garbledUserId: string): string {
    try {
        return garbledUserId.match(/\d/g).join("");
    } catch (e) {
        LOGGER.error(`${e.message} || ${e.stack}`)
        return undefined;
    }
}

export const CREATE_ERROR_EMBED = (title, message) => {
    return new MessageEmbed().setTitle(title).setDescription(message).setColor(ERROR_COLOR)
}
export const CREATE_DEFAULT_EMBED = (title, message) => {
    return new MessageEmbed().setTitle(title).setDescription(message).setColor(DEFAULT_COLOR)
}
export const constrain = (num: number, min: number, max: number): number => {
    const MIN = min || 1;
    const MAX = max || 20;
    return Math.min(Math.max(num, MIN), MAX)
}
