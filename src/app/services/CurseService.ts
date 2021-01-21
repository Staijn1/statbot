import * as path from "path";
import * as fs from "fs";
import {DatabaseService} from "./DatabaseService";
import {CursePOJO} from "../pojo/CursePOJO";
import {DESC} from "../utils/constants";

class CurseService extends DatabaseService {
    CURE_WORD_LIST_LOCATION = path.join(__dirname, "..", "..", "assets", "data", "curse.json");
    curseWords: string[] = [];

    constructor() {
        super('curseData.nedb')
        this.loadWords();
    }


    loadWords(): void {
        if (this.curseWords) this.curseWords = [];
        this.curseWords = JSON.parse(fs.readFileSync(this.CURE_WORD_LIST_LOCATION, {encoding: "utf-8"}));
    }

    /** Function that count occurrences of a substring in a string;
     * @param {String} string               The string
     * @param {String} subString            The sub string to search for
     * @param {Boolean} [allowOverlapping]  Optional. (Default:false)
     *
     * @author Vitim.us https://gist.github.com/victornpb/7736865
     * @see Unit Test https://jsfiddle.net/Victornpb/5axuh96u/
     * @see http://stackoverflow.com/questions/4009756/how-to-count-string-occurrence-in-string/7924240#7924240
     */
    occurrences(string: string, subString: string, allowOverlapping?: boolean): number {
        string += "";
        subString += "";
        if (subString.length <= 0) return (string.length + 1);

        let n = 0, pos = 0;
        const step = allowOverlapping ? 1 : subString.length;

        // eslint-disable-next-line no-constant-condition
        while (true) {
            pos = string.indexOf(subString, pos);
            if (pos >= 0) {
                ++n;
                pos += step;
            } else break;
        }
        return n;
    }

    async find(sort = undefined): Promise<CursePOJO[]> {
        const resultDatabase = await this.conn.find({}).sort(sort);
        const curses = [];
        resultDatabase.forEach(row => {
            curses.push(new CursePOJO(row.username, row.userid, row.curseCount, row.cursePerDay));
        });

        return curses;
    }

    async findOne(options: unknown): Promise<CursePOJO> {
        const result = await this.conn.findOne(options);
        if (result) return new CursePOJO(result.username, result.userid, result.curseCount, result.cursePerDay);
        else return undefined
    }

    getCurseCount(content: string): number {
        let curseCount = 0;
        for (const curseWord of curseService.curseWords) {
            curseCount += curseService.occurrences(content.toLowerCase(), curseWord.toLowerCase(), false);
        }
        return curseCount;
    }

    async getTopCursers(): Promise<CursePOJO[]> {
        const topCursers: CursePOJO[] = [];
        const items = await this.conn.find({}).sort({curseCount: DESC}).limit(10).exec();
        items.forEach(doc => {
            topCursers.push(new CursePOJO(doc.username, doc.userid, doc.curseCount, doc.cursePerDay));
        })
        return topCursers;
    }
}

export const curseService = new CurseService();
