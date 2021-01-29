"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.curseService = exports.CurseServiceTest = void 0;
const tslib_1 = require("tslib");
const path = tslib_1.__importStar(require("path"));
const fs = tslib_1.__importStar(require("fs"));
const DatabaseService_1 = require("./DatabaseService");
const CursePOJO_1 = require("../pojo/CursePOJO");
const constants_1 = require("../utils/constants");
class CurseService extends DatabaseService_1.DatabaseService {
    constructor() {
        super('curseData.nedb');
        this.CURE_WORD_LIST_LOCATION = path.join(__dirname, "..", "..", "assets", "data", "curse.json");
        this.curseWords = [];
        this.loadWords();
    }
    loadWords() {
        if (this.curseWords)
            this.curseWords = [];
        this.curseWords = JSON.parse(fs.readFileSync(this.CURE_WORD_LIST_LOCATION, { encoding: "utf-8" }));
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
    occurrences(string, subString, allowOverlapping) {
        string += "";
        subString += "";
        if (subString.length <= 0)
            return (string.length + 1);
        let n = 0, pos = 0;
        const step = allowOverlapping ? 1 : subString.length;
        // eslint-disable-next-line no-constant-condition
        while (true) {
            pos = string.indexOf(subString, pos);
            if (pos >= 0) {
                ++n;
                pos += step;
            }
            else
                break;
        }
        return n;
    }
    async findAll(sort = undefined) {
        const resultDatabase = await this.conn.find({}).sort(sort);
        const curses = [];
        resultDatabase.forEach(row => {
            curses.push(new CursePOJO_1.CursePOJO(row.username, row.userid, row.curseCountAllTime, row.countPerDays));
        });
        return curses;
    }
    async findOne(options) {
        const result = await this.conn.findOne(options);
        if (result)
            return new CursePOJO_1.CursePOJO(result.username, result.userid, result.curseCountAllTime, result.countPerDays);
        else
            return undefined;
    }
    getCurseCount(content) {
        let curseCount = 0;
        for (const curseWord of exports.curseService.curseWords) {
            curseCount += exports.curseService.occurrences(content.toLowerCase(), curseWord.toLowerCase(), false);
        }
        return curseCount;
    }
    async getTopCursersOfAllTime() {
        const topCursers = [];
        const items = await this.conn.find({}).exec();
        items.forEach((doc, index) => {
            topCursers[index] = new CursePOJO_1.CursePOJO(doc.username, doc.userid, doc.curseCountAllTime, doc.countPerDays);
            let cursesThisMonth = 0;
            try {
                topCursers[index].countPerDays.forEach(day => {
                    cursesThisMonth += day.count;
                });
            }
            catch (e) {
                if (e.message === 'Cannot read property \'forEach\' of undefined') {
                    topCursers[index].countPerDays = [];
                    this.update({ userid: topCursers[index].userid }, topCursers[index]);
                }
                else {
                    constants_1.LOGGER.error(`${e.message} || ${e.stack}`);
                }
            }
            topCursers[index].curseCountAllTime += cursesThisMonth;
        });
        topCursers.sort((a, b) => b.curseCountAllTime - a.curseCountAllTime);
        return topCursers;
    }
    async getTopCursersOfThisMonth() {
        const topCursers = [];
        const items = await this.conn.find({}).exec();
        items.forEach((doc, index) => {
            topCursers[index] = new CursePOJO_1.CursePOJO(doc.username, doc.userid, doc.curseCountAllTime, doc.countPerDays);
            let cursesThisMonth = 0;
            try {
                topCursers[index].countPerDays.forEach(day => {
                    cursesThisMonth += day.count;
                });
            }
            catch (e) {
                if (e.message === 'Cannot read property \'forEach\' of undefined') {
                    topCursers[index].countPerDays = [];
                    this.update({ userid: topCursers[index].userid }, topCursers[index]);
                }
                else {
                    constants_1.LOGGER.error(`${e.message} || ${e.stack}`);
                }
            }
            topCursers[index].curseCountAllTime = 0;
            topCursers[index].curseCountAllTime += cursesThisMonth;
        });
        topCursers.sort((a, b) => b.curseCountAllTime - a.curseCountAllTime);
        return topCursers;
    }
}
class CurseServiceTest extends CurseService {
}
exports.CurseServiceTest = CurseServiceTest;
exports.curseService = new CurseService();
//# sourceMappingURL=CurseService.js.map