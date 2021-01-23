import {CountPerDay} from "../utils/types";


export class CursePOJO {
    username: string;
    userid: string;
    curseCountAllTime = 0;
    countPerDays: CountPerDay[];

    constructor(username: string, userid: string, curseCountAllTime: number, countPerDays?: CountPerDay[]) {
        this.username = username;
        this.userid = userid;
        this.curseCountAllTime = curseCountAllTime;
        this.countPerDays = countPerDays;
    }
}
