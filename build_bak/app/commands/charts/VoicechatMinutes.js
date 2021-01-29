"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoicechatMinutes = void 0;
const tslib_1 = require("tslib");
const discord_1 = require("@typeit/discord");
const constants_1 = require("../../utils/constants");
const ChartService_1 = require("../../services/ChartService");
const functions_1 = require("../../utils/functions");
const OnlineTimeService_1 = require("../../services/OnlineTimeService");
const luxon_1 = require("luxon");
class VoicechatMinutes {
    constructor() {
        this.chartService = new ChartService_1.ChartService();
    }
    async showMinutesChart(message) {
        let image;
        if (message.args.user) {
            let targetedUser = await OnlineTimeService_1.onlineTimeService.findOne({ userid: functions_1.getUserId(message.args.user) });
            const title = targetedUser ? `Voicechat minutes per day for ${targetedUser.username}` : '';
            targetedUser = this.convertUser(targetedUser);
            image = await this.chartService.handleUserChart(targetedUser, title, "# of minutes in voicechat per day");
        }
        else {
            const allUsers = await OnlineTimeService_1.onlineTimeService.getMostInVoicechatThisMonth();
            const convertedUsers = [];
            for (const user of allUsers.slice(0, 10)) {
                convertedUsers.push(this.convertUser(user));
            }
            image = await this.chartService.handleTop10Chart(convertedUsers, "Top 10 Users In Voicechat This Month", "Voicechat minute count for");
        }
        await this.chartService.sendChart(message, image);
    }
    convertUser(targetedUser) {
        targetedUser.countPerDays = [];
        if (targetedUser.vcCountPerDay) {
            targetedUser.vcCountPerDay.forEach((vcDay, index) => {
                const converted = { count: vcDay.minutes, date: luxon_1.DateTime.fromISO(vcDay.lastJoined).toFormat(constants_1.DATE_FORMAT) };
                targetedUser.countPerDays[index] = converted;
            });
        }
        return targetedUser;
    }
}
tslib_1.__decorate([
    discord_1.Command("vcminutes :user"),
    discord_1.Infos({
        description: `Get a line chart with the minutes the user(s) spent in voicechat this month. Formats:\n${constants_1.PREFIX}vcminutes | Shows the minutes per day of the top 10 most chatty users\n${constants_1.PREFIX}vcminutes @User | Gets the minutes per day in voicechat of that user\n`,
        page: 2,
        admin: false,
    }),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [discord_1.CommandMessage]),
    tslib_1.__metadata("design:returntype", Promise)
], VoicechatMinutes.prototype, "showMinutesChart", null);
exports.VoicechatMinutes = VoicechatMinutes;
//# sourceMappingURL=VoicechatMinutes.js.map