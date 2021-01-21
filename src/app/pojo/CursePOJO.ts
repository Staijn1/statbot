export type CursePerDay = {
    date: string,
    count: number;
}

export class CursePOJO {
    username: string;
    userid: string;
    curseCountAllTime = 0;
    cursePerDay: CursePerDay[];

    constructor(username: string, userid: string,curseCountAllTime: number, cursePerDay?: CursePerDay[]) {
        this.username = username;
        this.userid = userid;
        if (curseCountAllTime) this.curseCountAllTime = curseCountAllTime;
        this.cursePerDay = cursePerDay;
    }
}
