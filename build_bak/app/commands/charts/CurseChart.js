"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurseChart = void 0;
const tslib_1 = require("tslib");
const discord_1 = require("@typeit/discord");
const constants_1 = require("../../utils/constants");
const ChartService_1 = require("../../services/ChartService");
const CurseService_1 = require("../../services/CurseService");
const functions_1 = require("../../utils/functions");
class CurseChart {
    constructor() {
        this.chartService = new ChartService_1.ChartService();
    }
    async showCurseChart(message) {
        let image;
        if (message.args.user) {
            const targetedUser = await CurseService_1.curseService.findOne({ userid: functions_1.getUserId(message.args.user) });
            image = await this.chartService.handleUserChart(targetedUser, `Curse count for user ${targetedUser.username}`, "# of curses per day");
        }
        else {
            const allusers = await CurseService_1.curseService.getTopCursersOfThisMonth();
            image = await this.chartService.handleTop10Chart(allusers.slice(0, 10), "Top 10 Profane Users This Month", 'Curse count for');
        }
        await this.chartService.sendChart(message, image);
    }
}
tslib_1.__decorate([
    discord_1.Command("cursechart :user"),
    discord_1.Infos({
        description: `Get a curse chart. Formats:\n${constants_1.PREFIX}cursechart | Gets all amount of curses per day in the last month\n${constants_1.PREFIX}cursechart @User | Gets the curse count per day of the tagged user\n`,
        page: 2,
        admin: false,
    }),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [discord_1.CommandMessage]),
    tslib_1.__metadata("design:returntype", Promise)
], CurseChart.prototype, "showCurseChart", null);
exports.CurseChart = CurseChart;
//# sourceMappingURL=CurseChart.js.map