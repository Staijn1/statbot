"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReloadCurseWords = void 0;
const tslib_1 = require("tslib");
const discord_1 = require("@typeit/discord");
const NotBot_1 = require("../../guards/NotBot");
const IsAdminWithResponse_1 = require("../../guards/IsAdminWithResponse");
const constants_1 = require("../../utils/constants");
const CurseService_1 = require("../../services/CurseService");
const functions_1 = require("../../utils/functions");
class ReloadCurseWords {
    async reloadCurseFile(message) {
        CurseService_1.curseService.loadWords();
        const responseToSend = functions_1.CREATE_DEFAULT_EMBED("Success", "Successfully reload the curse list!");
        const responseSent = await message.channel.send(responseToSend);
        setTimeout(async () => {
            await message.delete();
            await responseSent.delete();
        }, constants_1.TIMEOUT);
    }
}
tslib_1.__decorate([
    discord_1.Command("reloadcurse"),
    discord_1.Infos({
        description: "Reloads the list of cursewords that get checked",
        page: 3,
        admin: true
    }),
    discord_1.Guard(NotBot_1.NotBotMessage, IsAdminWithResponse_1.IsAdminWithResponse),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [discord_1.CommandMessage]),
    tslib_1.__metadata("design:returntype", Promise)
], ReloadCurseWords.prototype, "reloadCurseFile", null);
exports.ReloadCurseWords = ReloadCurseWords;
//# sourceMappingURL=ReloadCurseWords.js.map