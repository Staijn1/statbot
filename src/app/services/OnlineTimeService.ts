import * as path from "path";
import {DatabaseService} from "./DatabaseService";
import {Presence} from "discord.js";
import {UserPOJO} from "../pojo/UserPOJO";
import {DateTime} from "luxon";
import {DESC} from "../utils/constants";

class OnlineTimeService extends DatabaseService {
    FILE_LOCATION = path.join(__dirname, "..", "..", "assets", "data", "activity.json");

    constructor() {
        super('activity.nedb')
    }

    async find(sort = undefined, limit = undefined): Promise<UserPOJO[]> {
        const resultDatabase = await this.conn.find({}).sort(sort).limit(limit);
        const users = [];
        resultDatabase.forEach(row => {
            users.push(new UserPOJO(row.username, row.userid, row.totalMinutesOnline, row.onlineSince, row.isOnline, row.messagesSent, row.inactiveWarnings))
        });

        return users;
    }

    async findOne(options: unknown): Promise<UserPOJO> {
        const result = await this.conn.findOne(options);
        if (result) return new UserPOJO(result.username, result.userid, result.totalMinutesOnline, result.onlineSince, result.isOnline, result.messagesSent, result.inactiveWarnings);
        else return undefined
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
        return this.find({totalMinutesOnline: DESC}, 10);
    }

    updateOnlineTimeOnlineUser(changedUser: UserPOJO) {
        if (changedUser.isOnline) {
            changedUser.totalMinutesOnline += onlineTimeService.calculateTimeDifferenceInMinutes(changedUser.onlineSince);
            changedUser.onlineSince = DateTime.local().toISO();
        }
        onlineTimeService.update({userid: changedUser.userid}, changedUser);
    }

    async findMostActiveUsers(): Promise<UserPOJO[]> {
        return this.find({messagesSent: DESC}, 10);
    }

    async getTopInactiveMembers() {
        return this.find({inactiveWarnings: DESC});
    }
}

export const onlineTimeService = new OnlineTimeService();
