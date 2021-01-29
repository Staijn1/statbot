"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotBotVoice = exports.NotBotPresence = exports.NotBotMessage = void 0;
const NotBotMessage = async ([message], client, next) => {
    if (!message.author.bot) {
        await next();
    }
};
exports.NotBotMessage = NotBotMessage;
const NotBotPresence = async ([oldPresence, newPresence], client, next) => {
    const guildMember = newPresence.guild.members.cache.get(newPresence.userID);
    if (!guildMember.user.bot)
        await next();
};
exports.NotBotPresence = NotBotPresence;
const NotBotVoice = async ([oldVoiceState, newVoiceState], client, next) => {
    const guildMember = newVoiceState.member;
    if (!guildMember.user.bot)
        await next();
};
exports.NotBotVoice = NotBotVoice;
//# sourceMappingURL=NotBot.js.map