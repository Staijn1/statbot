import {DatabaseService} from "./DatabaseService";
import {Presence} from "discord.js";
import {UserPOJO} from "../pojo/UserPOJO";
import {DateTime} from "luxon";
import {DESC} from "../utils/constants";

class OnlineTimeService extends DatabaseService {
    constructor(fileurl?: string) {
        super(fileurl ?? 'activity.nedb')
    }

    async findAll(sort = undefined, limit = undefined): Promise<UserPOJO[]> {
        const resultDatabase = await this.conn.find({});
        const users = [];
        resultDatabase.forEach(row => {
            users.push(new UserPOJO(row.username, row.userid, row.minutesOnlinePerDay, row.totalMinutesOnlineAllTime, row.messagesSentAllTime, row.inactiveWarnings, row.countPerDays, row.vcMinutesAllTime, row.vcCountPerDay))
        });

        return users;
    }

    async findOne(options: unknown): Promise<UserPOJO> {
        const result = await this.conn.findOne(options);
        if (result) {
            let minutesOnline = 0;
            if (result.totalMinutesOnline) minutesOnline = result.totalMinutesOnline;
            return new UserPOJO(result.username, result.userid, result.minutesOnlinePerDay, minutesOnline, result.messagesSentAllTime, result.inactiveWarnings, result.countPerDays, result.vcMinutesAllTime, result.vcCountPerDay);
        } else return undefined
    }

    isOnline(presence: Presence): boolean {
        return presence.status === 'online' || presence.status === 'dnd' || presence.status === 'idle';
    }

    updateOnlineTimeOnlineUser(userChanged: UserPOJO, lastDayOnline: boolean) {
        const now = DateTime.local();
        if (!userChanged || !userChanged.minutesOnlinePerDay) return;


        const lastKnownRecord = userChanged.minutesOnlinePerDay[userChanged.minutesOnlinePerDay.length - 1];

        if (!lastKnownRecord.isOnline) return;

        const timeJoinedObject = DateTime.fromISO(lastKnownRecord.lastJoined);
        let timeSpentOnline = now.diff(timeJoinedObject, "minutes").minutes;
        const timeUntilMidnightFromOnlinetimestamp = DateTime.fromObject({
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
        } else {
            timeSpentOnline -= timeUntilMidnightFromOnlinetimestamp;
            lastKnownRecord.minutes += timeUntilMidnightFromOnlinetimestamp;
            let dayOnline = timeJoinedObject.plus({day: 1});
            while ((timeSpentOnline - 1440) > 0) {
                userChanged.minutesOnlinePerDay.push({lastJoined: dayOnline.toISO(), minutes: 1440, isOnline: false});
                dayOnline = dayOnline.plus({day: 1});
                timeSpentOnline -= 1440;
            }
            // If we have minutes left, add them to the remaining day
            if (timeSpentOnline >= 0) userChanged.minutesOnlinePerDay.push({
                lastJoined: dayOnline.toISO(),
                minutes: timeSpentOnline,
                isOnline: lastDayOnline
            });
        }
        lastKnownRecord.isOnline = lastDayOnline;
        this.update({userid: userChanged.userid}, userChanged);
    }

    async getMostActiveThisMonth(): Promise<UserPOJO[]> {
        const topActive = await this.findAll({messagesSent: DESC});
        topActive.forEach(user => {
            if (user.countPerDays) {
                user.messagesSentAllTime = 0;
                user.countPerDays.forEach(day => {
                    user.messagesSentAllTime += day.count;
                })
            }
        });

        topActive.sort((a, b) => {
            return b.messagesSentAllTime - a.messagesSentAllTime;
        })
        return topActive;
    }

    async getTopInactiveMembers() {
        return this.findAll({inactiveWarnings: DESC});
    }

    async getMostInVoicechatThisMonth(): Promise<UserPOJO[]> {
        const allUsers = await this.findAll();
        allUsers.forEach(user => {
            if (user.vcCountPerDay) {
                user.vcMinutesAllTime = 0;
                user.vcCountPerDay.forEach(day => {
                    user.vcMinutesAllTime += day.minutes;
                })
            }
        });
        return allUsers.sort(((a, b) => b.vcMinutesAllTime - a.vcMinutesAllTime))
    }

    async getMostInVoicechatAllTime(): Promise<UserPOJO[]> {
        const allUsers = await this.findAll();
        allUsers.forEach(user => {
            if (user.vcCountPerDay) {
                if (!user.vcMinutesAllTime) user.vcMinutesAllTime = 0;
                user.vcCountPerDay.forEach(day => {
                    user.vcMinutesAllTime += day.minutes;
                })
            }
        });
        return allUsers.sort(((a, b) => b.vcMinutesAllTime - a.vcMinutesAllTime))
    }

    async getTopOnlineMembersAllTime(): Promise<UserPOJO[]> {
        const users = await onlineTimeService.findAll();
        users.forEach(user => {
            user.minutesOnlinePerDay.forEach(day => {
                user.totalMinutesOnlineAllTime += day.minutes;
            });
        });
        users.sort(((a, b) => {
            return b.totalMinutesOnlineAllTime - a.totalMinutesOnlineAllTime;
        }));

        return users;
    }
}

export class OnlineTimeServiceTest extends OnlineTimeService {
}

export const onlineTimeService = new OnlineTimeService();
