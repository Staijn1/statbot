"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EPresence = void 0;
const tslib_1 = require("tslib");
const discord_1 = require("@typeit/discord");
const discord_js_1 = require("discord.js");
const NotBot_1 = require("../guards/NotBot");
const OnlineTimeService_1 = require("../services/OnlineTimeService");
const UserPOJO_1 = require("../pojo/UserPOJO");
const luxon_1 = require("luxon");
const constants_1 = require("../utils/constants");
class EPresence {
    async updatePresence(presence) {
        const newPresence = presence[1];
        const changedUser = await OnlineTimeService_1.onlineTimeService.findOne({ userid: newPresence.user.id });
        // If this user does not exist yet and went online, add him
        if (!changedUser && OnlineTimeService_1.onlineTimeService.isOnline(newPresence)) {
            constants_1.LOGGER.info(`Adding activities for ${newPresence.user.username}`);
            OnlineTimeService_1.onlineTimeService.addUserActivities(new UserPOJO_1.UserPOJO(newPresence.user.username, newPresence.user.id, 0, luxon_1.DateTime.local().toISO(), true, 0, 0, [], 0, []));
            return;
        }
        else if (!changedUser)
            return;
        const wasPreviousStateOnline = changedUser.isOnline;
        if (wasPreviousStateOnline && !OnlineTimeService_1.onlineTimeService.isOnline(newPresence)) {
            changedUser.isOnline = false;
            changedUser.totalMinutesOnline += OnlineTimeService_1.onlineTimeService.calculateTimeDifferenceInMinutes(changedUser.onlineSince);
            OnlineTimeService_1.onlineTimeService.update({ userid: changedUser.userid }, changedUser);
            constants_1.LOGGER.info(`${changedUser.username} went offline`);
        }
        else if (!wasPreviousStateOnline && OnlineTimeService_1.onlineTimeService.isOnline(newPresence)) {
            changedUser.isOnline = true;
            changedUser.onlineSince = luxon_1.DateTime.local().toISO();
            constants_1.LOGGER.info(`${changedUser.username} went online`);
            OnlineTimeService_1.onlineTimeService.update({ userid: changedUser.userid }, changedUser);
        }
    }
}
tslib_1.__decorate([
    discord_1.On('presenceUpdate'),
    discord_1.Guard(NotBot_1.NotBotPresence),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [discord_js_1.Presence]),
    tslib_1.__metadata("design:returntype", Promise)
], EPresence.prototype, "updatePresence", null);
exports.EPresence = EPresence;
//# sourceMappingURL=EPresence.js.map