export type CursePerDay = {
    date: string,
    count: number;
}

export class CursePOJO {
    username: string;
    userid: string;
    curseCount: number;
    cursePerDay: CursePerDay[];

    constructor(username: string, userid: string, curseCount: number, cursePerDay?: CursePerDay[]) {
        this.username = username;
        this.userid = userid;
        this.curseCount = curseCount;
        this.cursePerDay = cursePerDay;
    }
}
