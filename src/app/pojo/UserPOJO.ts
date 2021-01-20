export class UserPOJO {
    username: string;
    userid: string;
    totalMinutesOnline: number;
    onlineSince: string;
    isOnline: boolean;
    messagesSent: number;
    inactiveWarnings: number;

    constructor(username: string, userid: string, totalMinutesOnline: number, onlineSince: string, isOnline: boolean, messagesSent: number, inactiveWarnings: number) {
        this.username = username;
        this.userid = userid;
        this.totalMinutesOnline = totalMinutesOnline;
        this.onlineSince = onlineSince;
        this.isOnline = isOnline;
        this.messagesSent = messagesSent;
        this.inactiveWarnings = inactiveWarnings;
    }
}
