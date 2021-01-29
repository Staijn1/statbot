"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetInactiveUsers = void 0;
const tslib_1 = require("tslib");
const discord_1 = require("@typeit/discord");
const NotBot_1 = require("../../guards/NotBot");
const IsAdminWithResponse_1 = require("../../guards/IsAdminWithResponse");
const OnlineTimeService_1 = require("../../services/OnlineTimeService");
const functions_1 = require("../../utils/functions");
class GetInactiveUsers {
    async getInactive(message) {
        const responseEmbed = functions_1.CREATE_DEFAULT_EMBED("List of all most inactive users", "Users gain \"inactivity warnings\" if they send few messages in one month.\nThey can gain a buffer by being active. A high positive number means lots of inactivity. You can gain or lose one warning a month");
        const inactiveMembers = await OnlineTimeService_1.onlineTimeService.getTopInactiveMembers();
        inactiveMembers.forEach((user, index) => {
            if (user.inactiveWarnings > 0)
                responseEmbed.addField(`${index + 1}. ${user.username}`, `${user.inactiveWarnings} warning(s)`);
        });
        await message.channel.send(responseEmbed);
    }
}
tslib_1.__decorate([
    discord_1.Command("inactive"),
    discord_1.Infos({
        description: "Get a list of inactive users.",
        page: 3,
        admin: true
    }),
    discord_1.Guard(NotBot_1.NotBotMessage, IsAdminWithResponse_1.IsAdminWithResponse),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [discord_1.CommandMessage]),
    tslib_1.__metadata("design:returntype", Promise)
], GetInactiveUsers.prototype, "getInactive", null);
exports.GetInactiveUsers = GetInactiveUsers;
//# sourceMappingURL=InactiveUsers.js.map