import {CountPerDay, VCCountPerDay} from "../utils/types";

export class UserPOJO {
    username: string;
    userid: string;
    totalMinutesOnline: number;
    onlineSince: string;
    isOnline: boolean;
    messagesSentAllTime: number;
    inactiveWarnings: number;
    countPerDays: CountPerDay[];
    vcMinutesAllTime: number;
    vcCountPerDay: VCCountPerDay[];

    constructor(
        username: string,
        userid: string,
        totalMinutesOnline: number,
        onlineSince: string,
        isOnline: boolean,
        messagesSentAllTime: number,
        inactiveWarnings: number,
        countPerDays: CountPerDay[],
        vcMinutesAllTime: number,
        vcCountPerDay: VCCountPerDay[]
    ) {
        this.username = username;
        this.userid = userid;
        this.totalMinutesOnline = totalMinutesOnline;
        this.onlineSince = onlineSince;
        this.isOnline = isOnline;
        this.messagesSentAllTime = messagesSentAllTime;
        this.inactiveWarnings = inactiveWarnings;
        this.countPerDays = countPerDays;
        this.vcMinutesAllTime = vcMinutesAllTime;
        this.vcCountPerDay = vcCountPerDay;
    }
}
