"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetDoubleCurse = void 0;
const tslib_1 = require("tslib");
const discord_1 = require("@typeit/discord");
const NotBot_1 = require("../../guards/NotBot");
const IsAdminWithResponse_1 = require("../../guards/IsAdminWithResponse");
const functions_1 = require("../../utils/functions");
const CurseService_1 = require("../../services/CurseService");
class GetDoubleCurse {
    async calculateDoubleCurses(message) {
        const response = functions_1.CREATE_DEFAULT_EMBED("Double words are: ", "These words are double or include other words. Remove them for better performance. Fuck is equal to fucker");
        CurseService_1.curseService.loadWords();
        const doubleWords = [];
        //We need to pick a word to then compare with others. The first loop picks a word, the second one will loop through the others.
        //Only count occurences if the words are different, and only register it if the occurrences count is > 0
        for (let i = 0; i < CurseService_1.curseService.curseWords.length; i++) {
            for (let j = 0; j < CurseService_1.curseService.curseWords.length; j++) {
                const baseWord = CurseService_1.curseService.curseWords[i];
                const wordToCompareWith = CurseService_1.curseService.curseWords[j];
                if (baseWord !== wordToCompareWith) {
                    const count = CurseService_1.curseService.occurrences(baseWord, wordToCompareWith, false);
                    if (count > 0) {
                        const word = doubleWords.find(words => words.word === baseWord);
                        if (word) {
                            word.count += count;
                        }
                        else {
                            doubleWords.push({ count: count, word: baseWord });
                        }
                    }
                }
            }
        }
        for (const doubleWord of doubleWords) {
            response.addField(doubleWord.word, `Count: ${doubleWord.count}`);
        }
        await message.channel.send(response);
    }
}
tslib_1.__decorate([
    discord_1.Command("doublecurse"),
    discord_1.Infos({
        description: "Get double curse words in the curse list",
        page: 3,
        admin: true
    }),
    discord_1.Guard(NotBot_1.NotBotMessage, IsAdminWithResponse_1.IsAdminWithResponse),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [discord_1.CommandMessage]),
    tslib_1.__metadata("design:returntype", Promise)
], GetDoubleCurse.prototype, "calculateDoubleCurses", null);
exports.GetDoubleCurse = GetDoubleCurse;
//# sourceMappingURL=GetDoubleCurse.js.map