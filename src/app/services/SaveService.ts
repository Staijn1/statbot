import {UserPOJO} from "../pojo/UserPOJO";
import * as fs from "fs";
import * as path from "path";
import {Presence} from "discord.js";
import {DateTime} from "luxon";

class SaveService {
    users: UserPOJO[] = [];
    FILE_LOCATION = path.join(__dirname, "..", "..", "assets", "data", "activity.json");

    constructor() {
        this.parseJson();
    }

    parseJson(): void {
        if (this.users) this.users = [];
        const rawUsers = JSON.parse(this.readActivities());
        for (const raw of rawUsers) {
            const messagesSent = raw.messagesSent ? raw.messagesSent : 0;
            const inactivityWarning = raw.inactiveWarnings ? raw.inactiveWarnings : 0;
            this.users.push(new UserPOJO(raw.username, raw.userid, raw.totalMinutesOnline, raw.onlineSince, raw.isOnline, raw.curseCount, messagesSent, inactivityWarning))
        }
    }

    private readActivities(): string {
        return fs.readFileSync(this.FILE_LOCATION, {encoding: "utf-8"})
    }

    private saveActivities(): void {
        fs.writeFileSync(this.FILE_LOCATION, JSON.stringify(this.users, null, 2), {encoding: "utf-8"});
        this.parseJson();
    }

    findUserActivity(userid: string): UserPOJO {
        this.parseJson();
        return this.users.find(user => user.userid === userid);
    }

    addUserActivities(newUser: UserPOJO): void {
        this.users.push(newUser);
        this.saveActivities();
    }

    updateUserActivity(changedUser: UserPOJO) {
        const indexOfUser = this.users.findIndex(user => user.userid === changedUser.userid);
        this.users[indexOfUser] = changedUser;
        this.saveActivities();
    }

    updateAllUserActivity() {
        this.saveActivities();
    }

    isOnline(presence: Presence) {
        return presence.status === 'online' || presence.status === 'dnd' || presence.status === 'idle';
    }

    sort(param: (a: UserPOJO, b: UserPOJO) => number) {
        this.users.sort(param);
    }

    calculateTimeDifferenceInMinutes(onlineSince: DateTime) {
        const difference = DateTime.local().diff(onlineSince, 'minutes');
        return difference.minutes;
    }

    updateOnlineTime() {
        for (const user of this.users) {
            if (user.isOnline) {
                user.totalMinutesOnline += this.calculateTimeDifferenceInMinutes(user.onlineSince);
                user.onlineSince = DateTime.local();
            }
        }
        saveService.updateAllUserActivity();
    }
}

export const saveService = new SaveService();
