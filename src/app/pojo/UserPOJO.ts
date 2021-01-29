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
        this.minutesOnlinePerDay = minutesOnlinePerDay ?? [];
        this.totalMinutesOnlineAllTime = totalMinutesOnlineAllTime ?? 0;
        this.messagesSentAllTime = messagesSentAllTime ?? 0;
        this.inactiveWarnings = inactiveWarnings ?? 0;
        this.countPerDays = countPerDays ?? [];
        this.vcMinutesAllTime = vcMinutesAllTime ?? 0;
        this.vcCountPerDay = vcCountPerDay ?? [];
    }
}
