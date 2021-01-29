"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onlineTimeService = exports.OnlineTimeServiceTest = void 0;
const DatabaseService_1 = require("./DatabaseService");
const UserPOJO_1 = require("../pojo/UserPOJO");
const luxon_1 = require("luxon");
const constants_1 = require("../utils/constants");
class OnlineTimeService extends DatabaseService_1.DatabaseService {
    constructor(fileurl) {
        super(fileurl ?? 'activity.nedb');
    }
    async findAll(sort = undefined, limit = undefined) {
        const resultDatabase = await this.conn.find({}).sort(sort).limit(limit);
        const users = [];
        resultDatabase.forEach(row => {
            users.push(new UserPOJO_1.UserPOJO(row.username, row.userid, row.totalMinutesOnline, row.onlineSince, row.isOnline, row.messagesSentAllTime, row.inactiveWarnings, row.countPerDays, row.vcMinutesAllTime, row.vcCountPerDay));
        });
        return users;
    }
    async findOne(options) {
        const result = await this.conn.findOne(options);
        if (result)
            return new UserPOJO_1.UserPOJO(result.username, result.userid, result.totalMinutesOnline, result.onlineSince, result.isOnline, result.messagesSentAllTime, result.inactiveWarnings, result.countPerDays, result.vcMinutesAllTime, result.vcCountPerDay);
        else
            return undefined;
    }
    isOnline(presence) {
        return presence.status === 'online' || presence.status === 'dnd' || presence.status === 'idle';
    }
    addUserActivities(userPOJO) {
        this.insert(userPOJO);
    }
    calculateTimeDifferenceInMinutes(onlineSinceString) {
        const onlineSinceDate = luxon_1.DateTime.fromISO(onlineSinceString);
        return luxon_1.DateTime.local().diff(onlineSinceDate, 'minutes').minutes;
    }
    async getTopOnline() {
        return this.findAll({ totalMinutesOnline: constants_1.DESC }, 10);
    }
    updateOnlineTimeOnlineUser(changedUser) {
        if (changedUser.isOnline) {
            changedUser.totalMinutesOnline += this.calculateTimeDifferenceInMinutes(changedUser.onlineSince);
            changedUser.onlineSince = luxon_1.DateTime.local().toISO();
        }
        this.update({ userid: changedUser.userid }, changedUser);
    }
    async getMostActiveThisMonth() {
        const topActive = await this.findAll({ messagesSent: constants_1.DESC });
        topActive.forEach(user => {
            if (user.countPerDays) {
                user.messagesSentAllTime = 0;
                user.countPerDays.forEach(day => {
                    user.messagesSentAllTime += day.count;
                });
            }
        });
        topActive.sort((a, b) => {
            return b.messagesSentAllTime - a.messagesSentAllTime;
        });
        return topActive;
    }
    async getTopInactiveMembers() {
        return this.findAll({ inactiveWarnings: constants_1.DESC });
    }
    async getMostInVoicechatThisMonth() {
        const allUsers = await this.findAll();
        allUsers.forEach(user => {
            if (user.vcCountPerDay) {
                user.vcMinutesAllTime = 0;
                user.vcCountPerDay.forEach(day => {
                    user.vcMinutesAllTime += day.minutes;
                });
            }
        });
        return allUsers.sort(((a, b) => b.vcMinutesAllTime - a.vcMinutesAllTime));
    }
    async getMostInVoicechatAllTime() {
        const allUsers = await this.findAll();
        allUsers.forEach(user => {
            if (user.vcCountPerDay) {
                if (!user.vcMinutesAllTime)
                    user.vcMinutesAllTime = 0;
                user.vcCountPerDay.forEach(day => {
                    user.vcMinutesAllTime += day.minutes;
                });
            }
        });
        return allUsers.sort(((a, b) => b.vcMinutesAllTime - a.vcMinutesAllTime));
    }
}
class OnlineTimeServiceTest extends OnlineTimeService {
}
exports.OnlineTimeServiceTest = OnlineTimeServiceTest;
exports.onlineTimeService = new OnlineTimeService();
//# sourceMappingURL=OnlineTimeService.js.map