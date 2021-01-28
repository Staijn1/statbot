import {CountPerDay, OnlineMinutesPerDay, VCCountPerDay} from "../utils/types";

export class UserPOJO {
    username: string;
    userid: string;
    minutesOnlinePerDay: OnlineMinutesPerDay[];
    totalMinutesOnlineAllTime: number;
    messagesSentAllTime: number;
    inactiveWarnings: number;
    countPerDays: CountPerDay[];
    vcMinutesAllTime: number;
    vcCountPerDay: VCCountPerDay[];

    constructor(
        username: string,
        userid: string,
        minutesOnlinePerDay: OnlineMinutesPerDay[],
        totalMinutesOnlineAllTime: number,
        messagesSentAllTime: number,
        inactiveWarnings: number,
        countPerDays: CountPerDay[],
        vcMinutesAllTime: number,
        vcCountPerDay: VCCountPerDay[]
    ) {
        this.username = username;
        this.userid = userid;
        this.minutesOnlinePerDay = minutesOnlinePerDay;
        this.totalMinutesOnlineAllTime = totalMinutesOnlineAllTime;
        this.messagesSentAllTime = messagesSentAllTime;
        this.inactiveWarnings = inactiveWarnings;
        this.countPerDays = countPerDays;
        this.vcMinutesAllTime = vcMinutesAllTime;
        this.vcCountPerDay = vcCountPerDay;
    }
}
