import * as path from "path";
import * as fs from "fs";

class CurseService {
    FILE_LOCATION = path.join(__dirname, "..", "..", "assets", "data", "curse.json");
    curseWords: string[] = [];

    constructor() {
        this.loadWords();
    }

    loadWords(): void {
        if (this.curseWords) this.curseWords = [];
        this.curseWords = JSON.parse(fs.readFileSync(this.FILE_LOCATION, {encoding: "utf-8"}));
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
}

export const curseService = new CurseService();
