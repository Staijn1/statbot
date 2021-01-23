import {CountPerDay} from "../utils/types";

export class UserPOJO {
    username: string;
    userid: string;
    totalMinutesOnline: number;
    onlineSince: string;
    isOnline: boolean;
    messagesSentAllTime: number;
    inactiveWarnings: number;
    countPerDays: CountPerDay[];

    constructor(username: string, userid: string, totalMinutesOnline: number, onlineSince: string, isOnline: boolean, messagesSentAllTime: number, inactiveWarnings: number, countPerDays: CountPerDay[]) {
        this.username = username;
        this.userid = userid;
        this.totalMinutesOnline = totalMinutesOnline;
        this.onlineSince = onlineSince;
        this.isOnline = isOnline;
        this.messagesSentAllTime = messagesSentAllTime;
        this.inactiveWarnings = inactiveWarnings;
        this.countPerDays = countPerDays;
    }
}
