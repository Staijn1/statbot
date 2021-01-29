"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EGuildMemberRemove = void 0;
const tslib_1 = require("tslib");
const discord_1 = require("@typeit/discord");
const discord_js_1 = require("discord.js");
const OnlineTimeService_1 = require("../services/OnlineTimeService");
const CurseService_1 = require("../services/CurseService");
const UserPOJO_1 = require("../pojo/UserPOJO");
const CursePOJO_1 = require("../pojo/CursePOJO");
class EGuildMemberRemove {
    removeMemberFromMemory(member) {
        OnlineTimeService_1.onlineTimeService.insert(new UserPOJO_1.UserPOJO(member.user.username, member.user.id, [], 0, 0, 0, [], 0, []));
        CurseService_1.curseService.insert(new CursePOJO_1.CursePOJO(member.user.username, member.user.id, 0, []));
    }
}
tslib_1.__decorate([
    discord_1.On("guildMemberAdd"),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [discord_js_1.GuildMember]),
    tslib_1.__metadata("design:returntype", void 0)
], EGuildMemberRemove.prototype, "removeMemberFromMemory", null);
exports.EGuildMemberRemove = EGuildMemberRemove;
//# sourceMappingURL=EGuildMemberAdd.js.map