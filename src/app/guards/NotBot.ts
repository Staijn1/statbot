import {GuardFunction} from "@typeit/discord";

export const NotBotMessage: GuardFunction<"message"> = async (
    [message],
    client,
    next
) => {
    if (!message.author.bot) {
        await next();
    }
}

export const NotBotPresence: GuardFunction<"presenceUpdate"> = async (
    [oldPresence, newPresence],
    client,
    next
) => {
    const member = await newPresence.guild.members.cache.get(newPresence.userID)
    if (!member.user.bot) await next();
}
