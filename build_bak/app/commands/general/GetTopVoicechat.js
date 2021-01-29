"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetTopActiveUsers = void 0;
const tslib_1 = require("tslib");
const discord_1 = require("@typeit/discord");
const constants_1 = require("../../utils/constants");
const OnlineTimeService_1 = require("../../services/OnlineTimeService");
const functions_1 = require("../../utils/functions");
const luxon_1 = require("luxon");
class GetTopActiveUsers {
    async showTopVoiceChatUsers(message) {
        const embed = functions_1.CREATE_DEFAULT_EMBED("Top 10 Users In Voicechat", "The total amount of time spent in voicechat. Times are inaccurate when people are still in voicechat!");
        const users = await OnlineTimeService_1.onlineTimeService.findAll();
        users.forEach(user => {
            OnlineTimeService_1.onlineTimeService.updateOnlineTimeOnlineUser(user);
        });
        let sortedUsers = await OnlineTimeService_1.onlineTimeService.getMostInVoicechatAllTime();
        sortedUsers = sortedUsers.slice(0, 10);
        if (sortedUsers.length > 0) {
            try {
                const guildMember = message.guild.members.cache.get(sortedUsers[0].userid);
                embed.setThumbnail(guildMember.user.displayAvatarURL());
            }
            catch (e) {
                constants_1.LOGGER.error(`${e.message} || ${e.stack}`);
            }
        }
        for (let i = 0; i < sortedUsers.length; i++) {
            const user = sortedUsers[i];
            const formattedTime = luxon_1.Duration.fromObject({ minutes: Math.floor(user.vcMinutesAllTime) }).toFormat(("y 'years' d 'days' h 'hours' m 'minutes"));
            embed.addField(`${i + 1}. ${user.username}`, formattedTime);
        }
        const author = await OnlineTimeService_1.onlineTimeService.findOne({ userid: message.author.id });
        if (!author || !author.vcCountPerDay) {
            embed.setFooter("Sorry your voicechat time could not be loaded.");
        }
        else {
            author.vcCountPerDay.forEach(day => {
                if (!author.vcMinutesAllTime)
                    author.vcMinutesAllTime = 0;
                author.vcMinutesAllTime += day.minutes;
            });
            const formattedTime = luxon_1.Duration.fromObject({ minutes: Math.floor(author.vcMinutesAllTime) }).toFormat(("y 'years' d 'days' h 'hours' m 'minutes"));
            const position = sortedUsers.findIndex(user => user.userid === message.author.id);
            embed.setFooter(`You have been in voicechat for ${formattedTime}.\nPosition: ${position + 1}`);
        }
        await message.channel.send(embed);
    }
}
tslib_1.__decorate([
    discord_1.Command("topvoicechat"),
    discord_1.Infos({
        description: "Get the top users in voicechat, of all time",
        page: 1,
        admin: false
    }),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [discord_1.CommandMessage]),
    tslib_1.__metadata("design:returntype", Promise)
], GetTopActiveUsers.prototype, "showTopVoiceChatUsers", null);
exports.GetTopActiveUsers = GetTopActiveUsers;
//# sourceMappingURL=GetTopVoicechat.js.map