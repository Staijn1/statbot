"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActiveChart = void 0;
const tslib_1 = require("tslib");
const discord_1 = require("@typeit/discord");
const constants_1 = require("../../utils/constants");
const ChartService_1 = require("../../services/ChartService");
const functions_1 = require("../../utils/functions");
const OnlineTimeService_1 = require("../../services/OnlineTimeService");
class ActiveChart {
    constructor() {
        this.chartService = new ChartService_1.ChartService();
    }
    async showActiveChart(message) {
        let image;
        if (message.args.user) {
            const targetedUser = await OnlineTimeService_1.onlineTimeService.findOne({ userid: functions_1.getUserId(message.args.user) });
            const title = targetedUser ? `Message count per day for ${targetedUser.username}` : '';
            image = await this.chartService.handleUserChart(targetedUser, title, "# of messages per day");
        }
        else {
            const allUsers = await OnlineTimeService_1.onlineTimeService.getMostActiveThisMonth();
            image = await this.chartService.handleTop10Chart(allUsers.slice(0, 10), "Top 10 Active Users This Month", "Message count for");
        }
        await this.chartService.sendChart(message, image);
    }
}
tslib_1.__decorate([
    discord_1.Command("activechart :user"),
    discord_1.Infos({
        description: `Get an active chart. This chart contains messages sent per day. Formats:\n${constants_1.PREFIX}activechart | Gets all amount of messages per day in the last month\n${constants_1.PREFIX}activechart @User | Gets the message count per day of the tagged user\n`,
        page: 2,
        admin: false,
    }),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [discord_1.CommandMessage]),
    tslib_1.__metadata("design:returntype", Promise)
], ActiveChart.prototype, "showActiveChart", null);
exports.ActiveChart = ActiveChart;
//# sourceMappingURL=ActiveChart.js.map