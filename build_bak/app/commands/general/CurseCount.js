"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurseCount = void 0;
const tslib_1 = require("tslib");
const discord_1 = require("@typeit/discord");
const constants_1 = require("../../utils/constants");
const CurseService_1 = require("../../services/CurseService");
const functions_1 = require("../../utils/functions");
class CurseCount {
    async showCurseCount(message) {
        const response = functions_1.CREATE_DEFAULT_EMBED("Top 10 Profane Users", "Top 10 Profane Users of all time");
        const allusers = await CurseService_1.curseService.getTopCursersOfAllTime();
        const topCursers = allusers.slice(0, 10);
        if (topCursers.length > 0) {
            try {
                const member = message.guild.members.cache.get(topCursers[0].userid);
                response.setThumbnail(member.user.displayAvatarURL());
            }
            catch (e) {
                constants_1.LOGGER.error(`${e.message} || ${e.stack}`);
            }
        }
        for (let i = 0; i < topCursers.length; i++) {
            const user = topCursers[i];
            response.addField(`${i + 1}. ${user.username}`, `Cursed: ${user.curseCountAllTime} times.`);
        }
        const author = await CurseService_1.curseService.findOne({ userid: message.author.id });
        if (!author) {
            response.setFooter("Sorry your curse count could not be loaded.");
        }
        else {
            let cursesThisMonth = 0;
            author.countPerDays.forEach(day => cursesThisMonth += day.count);
            const index = topCursers.findIndex(user => user.userid === message.author.id);
            response.setFooter(`You have cursed ${author.curseCountAllTime + cursesThisMonth} times.\nPosition: ${index + 1}`);
        }
        await message.channel.send(response);
    }
}
tslib_1.__decorate([
    discord_1.Command("topcurse"),
    discord_1.Infos({
        description: "These are the most profane users",
        page: 1,
        admin: false,
    }),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [discord_1.CommandMessage]),
    tslib_1.__metadata("design:returntype", Promise)
], CurseCount.prototype, "showCurseCount", null);
exports.CurseCount = CurseCount;
//# sourceMappingURL=CurseCount.js.map