"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatBot = void 0;
const tslib_1 = require("tslib");
const discord_1 = require("@typeit/discord");
const Path = tslib_1.__importStar(require("path"));
const constants_1 = require("./utils/constants");
let StatBot = class StatBot {
    async notFound(message) {
        await message.channel.send(`Command not found, if you need help, use ${constants_1.PREFIX}help`);
    }
};
tslib_1.__decorate([
    discord_1.CommandNotFound(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [discord_1.CommandMessage]),
    tslib_1.__metadata("design:returntype", Promise)
], StatBot.prototype, "notFound", null);
StatBot = tslib_1.__decorate([
    discord_1.Discord(constants_1.PREFIX, {
        import: [
            Path.join(__dirname, "commands", "**", "*.js"),
            Path.join(__dirname, "events", "**", "*.js")
        ]
    })
], StatBot);
exports.StatBot = StatBot;
//# sourceMappingURL=StatBot.js.map