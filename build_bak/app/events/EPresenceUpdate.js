"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EPresenceUpdate = void 0;
const tslib_1 = require("tslib");
const discord_1 = require("@typeit/discord");
const NotBot_1 = require("../guards/NotBot");
const OnlineTimeService_1 = require("../services/OnlineTimeService");
const luxon_1 = require("luxon");
const constants_1 = require("../utils/constants");
const UserPOJO_1 = require("../pojo/UserPOJO");
class EPresenceUpdate {
    constructor() {
        this.localOnlinetimeService = OnlineTimeService_1.onlineTimeService;
    }
    async updatePresence(presence) {
        const newPresence = presence[1];
        const user = await this.localOnlinetimeService.findOne({ userid: newPresence.userID });
        const nowOnline = this.localOnlinetimeService.isOnline(newPresence);
        try {
            const wasOnline = user.minutesOnlinePerDay[user.minutesOnlinePerDay.length - 1].isOnline;
            if (!wasOnline && nowOnline) {
                await this.online(newPresence);
            }
            else if (wasOnline && !nowOnline) {
                await this.offline(newPresence);
            }
        }
        catch (e) {
            if (nowOnline)
                await this.online(newPresence);
        }
    }
    async online(joinedPresence) {
        const timestampJoined = luxon_1.DateTime.local();
        let userChanged = await this.localOnlinetimeService.findOne({ userid: joinedPresence.user.id });
        if (!userChanged) {
            userChanged = new UserPOJO_1.UserPOJO(joinedPresence.user.username, joinedPresence.user.id, [{
                    lastJoined: luxon_1.DateTime.local().toISO(),
                    isOnline: true,
                    minutes: 0
                }], 0, 0, 0, [{ date: luxon_1.DateTime.local().toFormat(constants_1.DATE_FORMAT), count: 0 }], 0, []);
            this.localOnlinetimeService.insert(userChanged);
        }
        if (!userChanged.minutesOnlinePerDay)
            userChanged.minutesOnlinePerDay = [];
        //Check if the user already joined today
        const todayInRecords = userChanged.minutesOnlinePerDay.find(day => timestampJoined.toFormat(constants_1.DATE_FORMAT) === luxon_1.DateTime.fromISO(day.lastJoined).toFormat(constants_1.DATE_FORMAT));
        if (todayInRecords) {
            todayInRecords.lastJoined = timestampJoined.toString();
            todayInRecords.isOnline = true;
        }
        else
            userChanged.minutesOnlinePerDay.push({
                lastJoined: timestampJoined.toString(),
                minutes: 0,
                isOnline: true
            });
        this.localOnlinetimeService.update({ userid: userChanged.userid }, userChanged);
        constants_1.LOGGER.info(`${joinedPresence.user.username} went online`);
    }
    async offline(leftPresence) {
        const timestampLeft = luxon_1.DateTime.local();
        const userChanged = await this.localOnlinetimeService.findOne({ userid: leftPresence.user.id });
        if (!userChanged || !userChanged.minutesOnlinePerDay)
            return;
        const lastKnownRecord = userChanged.minutesOnlinePerDay[userChanged.minutesOnlinePerDay.length - 1];
        const timeJoinedObject = luxon_1.DateTime.fromISO(lastKnownRecord.lastJoined);
        let timeSpentOnline = timestampLeft.diff(timeJoinedObject, "minutes").minutes;
        const timeUntilMidnightFromOnlinetimestamp = luxon_1.DateTime.fromObject({
            year: timeJoinedObject.year,
            month: timeJoinedObject.month,
            day: timeJoinedObject.day + 1,
            hour: 0,
            minute: 0,
            second: 0
        }).diff(timeJoinedObject, 'minutes').minutes;
        // If we did not pass midnight while online, add the time to the day we joined
        if (timeSpentOnline < timeUntilMidnightFromOnlinetimestamp) {
            lastKnownRecord.minutes += timeSpentOnline;
        }
        else {
            timeSpentOnline -= timeUntilMidnightFromOnlinetimestamp;
            lastKnownRecord.minutes += timeUntilMidnightFromOnlinetimestamp;
            let dayOnline = timeJoinedObject.plus({ day: 1 });
            while ((timeSpentOnline - 1440) > 0) {
                userChanged.minutesOnlinePerDay.push({ lastJoined: dayOnline.toISO(), minutes: 1440, isOnline: false });
                dayOnline = dayOnline.plus({ day: 1 });
                timeSpentOnline -= 1440;
            }
            // If we have minutes left, add them to the remaining day
            if (timeSpentOnline >= 0)
                userChanged.minutesOnlinePerDay.push({
                    lastJoined: dayOnline.toISO(),
                    minutes: timeSpentOnline,
                    isOnline: false
                });
        }
        lastKnownRecord.isOnline = false;
        this.localOnlinetimeService.update({ userid: userChanged.userid }, userChanged);
        constants_1.LOGGER.info(`${leftPresence.user.username} went offline`);
    }
}
tslib_1.__decorate([
    discord_1.On('presenceUpdate'),
    discord_1.Guard(NotBot_1.NotBotPresence),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Array]),
    tslib_1.__metadata("design:returntype", Promise)
], EPresenceUpdate.prototype, "updatePresence", null);
exports.EPresenceUpdate = EPresenceUpdate;
//# sourceMappingURL=EPresenceUpdate.js.map