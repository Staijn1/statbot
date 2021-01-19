import {DateTime} from "luxon";

export class UserPOJO {
    username: string;
    userid: string;
    totalMinutesOnline: number;
    onlineSince: DateTime;
    isOnline: boolean;
    curseCount: number;
    messagesSent: number;
    inactiveWarnings: number;

    constructor(username: string, userid: string, totalMinutesOnline: number, onlineSince: string, isOnline: boolean, curseCount: number, messagesSent: number, inactiveWarnings: number) {
        this.username = username;
        this.userid = userid;
        this.totalMinutesOnline = totalMinutesOnline;
        this.onlineSince = DateTime.fromISO(onlineSince);
        this.isOnline = isOnline;
        this.curseCount = curseCount;
        this.messagesSent = messagesSent;
        this.inactiveWarnings = inactiveWarnings;
    }
}
