"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetTopActiveUsers = void 0;
const tslib_1 = require("tslib");
const discord_1 = require("@typeit/discord");
const constants_1 = require("../../utils/constants");
const OnlineTimeService_1 = require("../../services/OnlineTimeService");
const functions_1 = require("../../utils/functions");
class GetTopActiveUsers {
    async showTopActiveUsers(message) {
        const embed = functions_1.CREATE_DEFAULT_EMBED("Top 10 Active Users", "The count of messages of this month");
        const allUsers = await OnlineTimeService_1.onlineTimeService.getMostActiveThisMonth();
        const top10users = allUsers.slice(0, 10);
        const guildUser = message.guild.members.cache.get(top10users[0].userid);
        try {
            embed.setThumbnail(guildUser.user.displayAvatarURL());
        }
        catch (e) {
            constants_1.LOGGER.error(`${e.message} || ${e.stack}`);
        }
        for (let i = 0; i < top10users.length; i++) {
            const user = top10users[i];
            embed.addField(`${i + 1}. ${user.username}`, `${user.messagesSentAllTime} messages sent`);
        }
        const author = await OnlineTimeService_1.onlineTimeService.findOne({ userid: message.author.id });
        if (!author) {
            embed.setFooter("Sorry your message count could not be loaded.");
        }
        else {
            let messagesThisMonth = 0;
            author.countPerDays.forEach(day => messagesThisMonth += day.count);
            const position = top10users.findIndex(user => user.userid === message.author.id);
            embed.setFooter(`You have sent ${author.messagesSentAllTime + messagesThisMonth} messages this month.\nPosition: ${position + 1}`);
        }
        await message.channel.send(embed);
    }
}
tslib_1.__decorate([
    discord_1.Command("topactive"),
    discord_1.Infos({
        description: "Get the top active users based on messages, of all time",
        page: 1,
        admin: false
    }),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [discord_1.CommandMessage]),
    tslib_1.__metadata("design:returntype", Promise)
], GetTopActiveUsers.prototype, "showTopActiveUsers", null);
exports.GetTopActiveUsers = GetTopActiveUsers;
//# sourceMappingURL=GetTopMessages.js.map