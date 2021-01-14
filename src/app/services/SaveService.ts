import {UserPOJO} from "../pojo/UserPOJO";
import * as fs from "fs";
import * as path from "path";
import {Presence} from "discord.js";

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
            this.users.push(new UserPOJO(raw.username, raw.userid, raw.totalMinutesOnline, raw.onlineSince))
        }
    }

    private readActivities(): string {
        return fs.readFileSync(this.FILE_LOCATION, {encoding: "utf-8"})
    }

    private saveActivities(): void {
        fs.writeFileSync(this.FILE_LOCATION, JSON.stringify(this.users), {encoding: "utf-8"});
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

    isOnline(presence: Presence) {
        return presence.status === 'online' || presence.status === 'dnd';
    }
}

export const saveService = new SaveService();
