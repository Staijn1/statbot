import {DateTime} from "luxon";

export class UserPOJO {
    username: string;
    userid: string;
    totalMinutesOnline: number;
    onlineSince: DateTime;


    constructor(username?: string, userid?: string, totalMinutesOnline?: number, onlineSince?: string) {
        this.username = username;
        this.userid = userid;
        this.totalMinutesOnline = totalMinutesOnline;
        this.onlineSince = DateTime.fromISO(onlineSince);
    }
}
