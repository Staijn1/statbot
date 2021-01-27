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
    const guildMember = newPresence.guild.members.cache.get(newPresence.userID)
    if (!guildMember.user.bot) await next();
}

export const NotBotVoice: GuardFunction<"voiceStateUpdate"> = async (
    [oldVoiceState, newVoiceState],
    client,
    next
) => {
    const guildMember = newVoiceState.member;
    if (!guildMember.user.bot) await next();
}
