"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResetCurse = void 0;
const tslib_1 = require("tslib");
const discord_1 = require("@typeit/discord");
const NotBot_1 = require("../../guards/NotBot");
const IsAdminWithResponse_1 = require("../../guards/IsAdminWithResponse");
const constants_1 = require("../../utils/constants");
const CurseService_1 = require("../../services/CurseService");
const functions_1 = require("../../utils/functions");
class ResetCurse {
    async resetCurse(message) {
        this.responseEmbed = functions_1.CREATE_DEFAULT_EMBED("Success", "Altered curse count succesfully!");
        if (message.args.length > 2) {
            this.responseEmbed = functions_1.CREATE_ERROR_EMBED('Error!', `Invalid amount or order of parameters! Use ${constants_1.PREFIX}help for help`);
        }
        // No parameter is supplied if this is true. Reset all cursecounts.
        if (!message.args.username && !message.args.amount) {
            const users = await CurseService_1.curseService.findAll();
            users.forEach(user => {
                user.curseCountAllTime = 0;
                user.countPerDays = [];
                CurseService_1.curseService.update({ userid: user.userid }, user);
            });
        }
        else if (message.args.username && !message.args.amount && typeof message.args.username === "string") {
            await this.updateUser(message, 0);
        }
        else if (message.args.username && message.args.amount && typeof message.args.username === "string" && typeof message.args.amount === 'number') {
            await this.updateUser(message, message.args.amount);
        }
        else {
            this.responseEmbed = functions_1.CREATE_ERROR_EMBED('Error!', `Invalid amount or order of parameters! Use ${constants_1.PREFIX}help for help`);
        }
        const sentMessage = await message.channel.send(this.responseEmbed);
        await message.delete({ timeout: constants_1.TIMEOUT });
        await sentMessage.delete({ timeout: constants_1.TIMEOUT });
    }
    async updateUser(message, amount) {
        const user = await CurseService_1.curseService.findOne({ userid: functions_1.getUserId(message.args.username) });
        if (user) {
            user.curseCountAllTime = amount;
            user.countPerDays = [];
            CurseService_1.curseService.update({ userid: user.userid }, user);
        }
        else {
            this.responseEmbed = functions_1.CREATE_ERROR_EMBED("Error!", "User not found!");
        }
    }
}
tslib_1.__decorate([
    discord_1.Command("resetcurse :username :amount"),
    discord_1.Infos({
        description: `Resets the curse counter. Formats:\n${constants_1.PREFIX}resetCurse | Resets all users curse stats\n${constants_1.PREFIX}resetCurse @User | Resets the user curse count to 0\n${constants_1.PREFIX}resetCurse @User 100 | Sets user to 100`,
        admin: true,
        page: 3,
    }),
    discord_1.Guard(NotBot_1.NotBotMessage, IsAdminWithResponse_1.IsAdminWithResponse),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [discord_1.CommandMessage]),
    tslib_1.__metadata("design:returntype", Promise)
], ResetCurse.prototype, "resetCurse", null);
exports.ResetCurse = ResetCurse;
//# sourceMappingURL=ResetCurse.js.map