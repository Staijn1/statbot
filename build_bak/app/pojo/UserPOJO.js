"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserPOJO = void 0;
class UserPOJO {
    constructor(username, userid, totalMinutesOnline, onlineSince, isOnline, messagesSentAllTime, inactiveWarnings, countPerDays, vcMinutesAllTime, vcCountPerDay) {
        this.username = username;
        this.userid = userid;
        this.totalMinutesOnline = totalMinutesOnline;
        this.onlineSince = onlineSince;
        this.isOnline = isOnline;
        this.messagesSentAllTime = messagesSentAllTime;
        this.inactiveWarnings = inactiveWarnings;
        this.countPerDays = countPerDays;
        this.vcMinutesAllTime = vcMinutesAllTime;
        this.vcCountPerDay = vcCountPerDay;
    }
}
exports.UserPOJO = UserPOJO;
//# sourceMappingURL=UserPOJO.js.map