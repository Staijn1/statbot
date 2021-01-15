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
    const guild = await client.guilds.fetch(process.env.GUILD_TOKEN)
    const member = await guild.members.fetch(newPresence.userID);
    if (!member.user.bot) await next();
}
