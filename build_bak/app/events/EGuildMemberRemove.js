"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EGuildMemberRemove = void 0;
const tslib_1 = require("tslib");
const discord_1 = require("@typeit/discord");
const discord_js_1 = require("discord.js");
const OnlineTimeService_1 = require("../services/OnlineTimeService");
const CurseService_1 = require("../services/CurseService");
class EGuildMemberRemove {
    removeMemberFromMemory(member) {
        OnlineTimeService_1.onlineTimeService.remove({ userid: member[0].user.id });
        CurseService_1.curseService.remove({ userid: member[0].user.id });
    }
}
tslib_1.__decorate([
    discord_1.On("guildMemberRemove"),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [discord_js_1.GuildMember]),
    tslib_1.__metadata("design:returntype", void 0)
], EGuildMemberRemove.prototype, "removeMemberFromMemory", null);
exports.EGuildMemberRemove = EGuildMemberRemove;
//# sourceMappingURL=EGuildMemberRemove.js.map