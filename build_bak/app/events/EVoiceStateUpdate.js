"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EVoiceStateUpdate = void 0;
const tslib_1 = require("tslib");
const discord_1 = require("@typeit/discord");
const NotBot_1 = require("../guards/NotBot");
const luxon_1 = require("luxon");
const OnlineTimeService_1 = require("../services/OnlineTimeService");
const constants_1 = require("../utils/constants");
class EVoiceStateUpdate {
    constructor() {
        this.localOnlinetimeService = OnlineTimeService_1.onlineTimeService;
    }
    updateVoicechatPresence(voiceState) {
        const oldStateChannel = voiceState[0].channelID == null ? undefined : voiceState[0].channelID;
        const newStateChannel = voiceState[1].channelID == null ? undefined : voiceState[1].channelID;
        if (!oldStateChannel && newStateChannel) {
            this.userJoined(voiceState[1]).then();
        }
        else if (!newStateChannel) {
            this.userLeft(voiceState[1]).then();
        }
    }
    async userJoined(joinedVcState) {
        const timestampJoined = luxon_1.DateTime.local();
        const userChanged = await this.localOnlinetimeService.findOne({ userid: joinedVcState.member.id });
        if (!userChanged)
            return;
        if (!userChanged.vcCountPerDay)
            userChanged.vcCountPerDay = [];
        //Check if the user already joined today
        const todayInRecords = userChanged.vcCountPerDay.find(day => timestampJoined.toFormat(constants_1.DATE_FORMAT) === luxon_1.DateTime.fromISO(day.lastJoined).toFormat(constants_1.DATE_FORMAT));
        if (todayInRecords) {
            todayInRecords.lastJoined = timestampJoined.toString();
            todayInRecords.isInVc = true;
        }
        else
            userChanged.vcCountPerDay.push({ lastJoined: timestampJoined.toString(), minutes: 0, isInVc: true });
        this.localOnlinetimeService.update({ userid: userChanged.userid }, userChanged);
        constants_1.LOGGER.info(`${joinedVcState.member.user.username} joined voicechat`);
    }
    async userLeft(leftVcState) {
        const timestampLeft = luxon_1.DateTime.local();
        const userChanged = await this.localOnlinetimeService.findOne({ userid: leftVcState.member.id });
        if (!userChanged || !userChanged.vcCountPerDay)
            return;
        const lastKnownRecord = userChanged.vcCountPerDay[userChanged.vcCountPerDay.length - 1];
        const timeJoinedObject = luxon_1.DateTime.fromISO(lastKnownRecord.lastJoined);
        let timeSpentInVc = timestampLeft.diff(timeJoinedObject, "minutes").minutes;
        const timeUntilMidnightFromJoinTime = luxon_1.DateTime.fromObject({
            year: timeJoinedObject.year,
            month: timeJoinedObject.month,
            day: timeJoinedObject.day + 1,
            hour: 0,
            minute: 0,
            second: 0
        }).diff(timeJoinedObject, 'minutes').minutes;
        // If we did not pass midnight while in vc, add the time to the day we joined
        if (timeSpentInVc < timeUntilMidnightFromJoinTime) {
            lastKnownRecord.minutes += timeSpentInVc;
        }
        else {
            timeSpentInVc -= timeUntilMidnightFromJoinTime;
            lastKnownRecord.minutes += timeUntilMidnightFromJoinTime;
            let dayInVc = timeJoinedObject.plus({ day: 1 });
            while ((timeSpentInVc - 1440) > 0) {
                userChanged.vcCountPerDay.push({ lastJoined: dayInVc.toISO(), minutes: 1440, isInVc: false });
                dayInVc = dayInVc.plus({ day: 1 });
                timeSpentInVc -= 1440;
            }
            // If we have minutes left, add them to the remaining day
            if (timeSpentInVc >= 0)
                userChanged.vcCountPerDay.push({ lastJoined: dayInVc.toISO(), minutes: timeSpentInVc, isInVc: false });
        }
        lastKnownRecord.isInVc = false;
        this.localOnlinetimeService.update({ userid: userChanged.userid }, userChanged);
        constants_1.LOGGER.info(`${leftVcState.member.user.username} left voicechat`);
    }
}
tslib_1.__decorate([
    discord_1.On('voiceStateUpdate'),
    discord_1.Guard(NotBot_1.NotBotVoice),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Array]),
    tslib_1.__metadata("design:returntype", void 0)
], EVoiceStateUpdate.prototype, "updateVoicechatPresence", null);
exports.EVoiceStateUpdate = EVoiceStateUpdate;
//# sourceMappingURL=EVoiceStateUpdate.js.map