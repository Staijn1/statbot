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
        const resultDatabase = await this.conn.find({}).sort(sort).limit(limit);
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
            if(result.totalMinutesOnline) minutesOnline = result.totalMinutesOnline;
            return new UserPOJO(result.username, result.userid, result.minutesOnlinePerDay, minutesOnline, result.messagesSentAllTime, result.inactiveWarnings, result.countPerDays, result.vcMinutesAllTime, result.vcCountPerDay);
        } else return undefined
    }

    isOnline(presence: Presence): boolean {
        return presence.status === 'online' || presence.status === 'dnd' || presence.status === 'idle';
    }

    addUserActivities(userPOJO: UserPOJO) {
        this.insert(userPOJO);
    }

    calculateTimeDifferenceInMinutes(onlineSinceString: string): number {
        const onlineSinceDate = DateTime.fromISO(onlineSinceString);
        return DateTime.local().diff(onlineSinceDate, 'minutes').minutes;
    }

    async getTopOnline(): Promise<UserPOJO[]> {
        return this.findAll({totalMinutesOnlineAllTime: DESC}, 10);
    }

    updateOnlineTimeOnlineUser(changedUser: UserPOJO) {
        throw Error('Not implemented')
        /*
        if (changedUser.isOnline) {
            changedUser.totalMinutesOnlineAllTime += this.calculateTimeDifferenceInMinutes(changedUser.onlineSince);
            changedUser.onlineSince = DateTime.local().toISO();
        }

        this.update({userid: changedUser.userid}, changedUser);
        */
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
}

export class OnlineTimeServiceTest extends OnlineTimeService {
}

export const onlineTimeService = new OnlineTimeService();
