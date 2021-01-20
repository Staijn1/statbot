export class CursePOJO {
    username: string;
    userid: string;
    curseCount: number;

    constructor(username: string, userid: string, curseCount: number) {
        this.username = username;
        this.userid = userid;
        this.curseCount = curseCount;
    }
}
