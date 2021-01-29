"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetTopOnlineUsers = void 0;
const tslib_1 = require("tslib");
const discord_1 = require("@typeit/discord");
const constants_1 = require("../../utils/constants");
const luxon_1 = require("luxon");
const functions_1 = require("../../utils/functions");
const OnlineTimeService_1 = require("../../services/OnlineTimeService");
class GetTopOnlineUsers {
    async showTop10OnlineUsers(message) {
        const embed = functions_1.CREATE_DEFAULT_EMBED("Top 10 Online Users", "Times are sum of all online time");
        const users = await OnlineTimeService_1.onlineTimeService.findAll();
        users.forEach(user => {
            OnlineTimeService_1.onlineTimeService.updateOnlineTimeOnlineUser(user);
        });
        const sortedUsers = await OnlineTimeService_1.onlineTimeService.getTopOnline();
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
            const formattedTime = luxon_1.Duration.fromObject({ minutes: Math.floor(user.totalMinutesOnline) }).toFormat(("y 'years' d 'days' h 'hours' m 'minutes"));
            embed.addField(`${i + 1}. ${user.username}`, formattedTime);
        }
        const author = await OnlineTimeService_1.onlineTimeService.findOne({ userid: message.author.id });
        if (!author) {
            embed.setFooter("Sorry your online time could not be loaded.");
        }
        else {
            const formattedTime = luxon_1.Duration.fromObject({ minutes: Math.floor(author.totalMinutesOnline) }).toFormat(("y 'years' d 'days' h 'hours' m 'minutes"));
            const position = sortedUsers.findIndex(user => user.userid === message.author.id);
            embed.setFooter(`You have been online for ${formattedTime}.\nPosition: ${position + 1}`);
        }
        await message.channel.send(embed);
    }
}
tslib_1.__decorate([
    discord_1.Command("toponline"),
    discord_1.Infos({
        description: "Get the top online users",
        page: 1,
        admin: false
    }),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [discord_1.CommandMessage]),
    tslib_1.__metadata("design:returntype", Promise)
], GetTopOnlineUsers.prototype, "showTop10OnlineUsers", null);
exports.GetTopOnlineUsers = GetTopOnlineUsers;
//# sourceMappingURL=GetTopOnlineUsers.js.map