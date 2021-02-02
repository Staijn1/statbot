import * as path from "path";
import * as fs from "fs";
import {DatabaseService} from "./DatabaseService";
import {CursePOJO} from "../pojo/CursePOJO";
import {DATE_FORMAT, LOGGER} from "../utils/constants";
import {DateTime} from "luxon";

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

    async findAll(sort = undefined): Promise<CursePOJO[]> {
        const resultDatabase = await this.conn.find({}).sort(sort);
        const curses = [];
        resultDatabase.forEach(row => {
            curses.push(new CursePOJO(row.username, row.userid, row.curseCountAllTime, row.countPerDays));
        });

        return curses;
    }

    async findOne(options: unknown): Promise<CursePOJO> {
        const result = await this.conn.findOne(options);
        if (result) return new CursePOJO(result.username, result.userid, result.curseCountAllTime, result.countPerDays);
        else return undefined
    }

    getCurseCount(content: string): number {
        let curseCount = 0;
        for (const curseWord of curseService.curseWords) {
            curseCount += curseService.occurrences(content.toLowerCase(), curseWord.toLowerCase(), false);
        }
        return curseCount;
    }

    async getTopCursersOfAllTime(): Promise<CursePOJO[]> {
        const users = await this.findAll();
        users.forEach((user, index) => {
            let cursesThisMonth = 0;
            try {
                user.countPerDays.forEach(day => {
                    cursesThisMonth += day.count;
                });
            } catch (e) {
                if (e.message === 'Cannot read property \'forEach\' of undefined') {
                    user.countPerDays = [{date: DateTime.local().toFormat(DATE_FORMAT), count: 0}];
                    this.update({userid: user.userid}, user)
                } else {
                    LOGGER.error(`${e.message} || ${e.stack}`);
                }
            }

            user.curseCountAllTime += cursesThisMonth;
        })

        users.sort((a, b) => b.curseCountAllTime - a.curseCountAllTime);
        return users;
    }

    async getTopCursersOfThisMonth(): Promise<CursePOJO[]> {
        const topCursers: CursePOJO[] = [];
        const items = await this.conn.find({}).exec();
        items.forEach((doc, index) => {
            topCursers[index] = new CursePOJO(doc.username, doc.userid, doc.curseCountAllTime, doc.countPerDays);
            let cursesThisMonth = 0;
            try {
                topCursers[index].countPerDays.forEach(day => {
                    cursesThisMonth += day.count;
                });
            } catch (e) {
                if (e.message === 'Cannot read property \'forEach\' of undefined') {
                    topCursers[index].countPerDays = [];
                    this.update({userid: topCursers[index].userid}, topCursers[index])
                } else {
                    LOGGER.error(`${e.message} || ${e.stack}`);
                }
            }
            topCursers[index].curseCountAllTime = 0;
            topCursers[index].curseCountAllTime += cursesThisMonth;
        })

        topCursers.sort((a, b) => b.curseCountAllTime - a.curseCountAllTime);
        return topCursers;
    }
}

export class CurseServiceTest extends CurseService {
}

export const curseService = new CurseService();
