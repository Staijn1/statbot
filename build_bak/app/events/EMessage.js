"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EMessage = void 0;
const tslib_1 = require("tslib");
const discord_1 = require("@typeit/discord");
const NotBot_1 = require("../guards/NotBot");
const CurseService_1 = require("../services/CurseService");
const CursePOJO_1 = require("../pojo/CursePOJO");
const OnlineTimeService_1 = require("../services/OnlineTimeService");
const UserPOJO_1 = require("../pojo/UserPOJO");
const luxon_1 = require("luxon");
const constants_1 = require("../utils/constants");
class EMessage {
    constructor() {
        this.emojis = ["0️⃣", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];
        this.replies = [
            "are you okay? Been swearing a lot 😇",
            "working on that curse count I see?",
            "wow.",
        ];
    }
    async message([message]) {
        await this.handleCursing(message);
        await this.handleMessageCount(message);
    }
    async handleCursing(message) {
        const curseCount = CurseService_1.curseService.getCurseCount(message.content);
        const user = await CurseService_1.curseService.findOne({ userid: message.author.id, });
        if (user) {
            // For backwards compatibleness
            if (!user.countPerDays)
                user.countPerDays = [];
            const today = user.countPerDays.find(day => day.date === luxon_1.DateTime.local().toFormat(constants_1.DATE_FORMAT));
            if (!today)
                user.countPerDays.push({ date: luxon_1.DateTime.local().toFormat(constants_1.DATE_FORMAT), count: curseCount });
            else
                today.count += curseCount;
            CurseService_1.curseService.update({ userid: message.author.id }, user);
        }
        else {
            CurseService_1.curseService.insert(new CursePOJO_1.CursePOJO(message.author.username, message.author.id, 0, [
                {
                    date: luxon_1.DateTime.local().toFormat(constants_1.DATE_FORMAT),
                    count: curseCount
                }
            ]));
        }
        if (curseCount > 1) {
            const numbers = this.convertToDigits(curseCount);
            try {
                for (const number of numbers) {
                    await message.react(this.emojis[number]);
                }
            }
            catch (e) {
                constants_1.LOGGER.error(`${e.message} || ${e.stack}`);
            }
        }
        if (curseCount > 5) {
            let randomReplyIndex = Math.floor(Math.random() * this.replies.length);
            while (randomReplyIndex == this.lastReplyIndex) {
                randomReplyIndex = Math.floor(Math.random() * this.replies.length);
            }
            this.lastReplyIndex = randomReplyIndex;
            await message.reply(this.replies[randomReplyIndex]);
        }
    }
    async handleMessageCount(message) {
        const user = await OnlineTimeService_1.onlineTimeService.findOne({ userid: message.author.id });
        if (user) {
            const todayObject = user.countPerDays.find(day => day.date === luxon_1.DateTime.local().toFormat(constants_1.DATE_FORMAT));
            if (todayObject)
                todayObject.count++;
            else
                user.countPerDays.push({ date: luxon_1.DateTime.local().toFormat(constants_1.DATE_FORMAT), count: 1 });
            OnlineTimeService_1.onlineTimeService.update({ userid: user.userid }, user);
        }
        else if (OnlineTimeService_1.onlineTimeService.isOnline(message.author.presence)) {
            OnlineTimeService_1.onlineTimeService.insert(new UserPOJO_1.UserPOJO(message.author.username, message.author.username, 0, luxon_1.DateTime.local().toISO(), true, 1, 0, [], 0, []));
        }
    }
    convertToDigits(number) {
        const output = [], stringNumber = number.toString();
        for (let i = 0, len = stringNumber.length; i < len; i += 1) {
            output.push(+stringNumber.charAt(i));
        }
        return output;
    }
}
tslib_1.__decorate([
    discord_1.On("message"),
    discord_1.Guard(NotBot_1.NotBotMessage),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], EMessage.prototype, "message", null);
exports.EMessage = EMessage;
//# sourceMappingURL=EMessage.js.map