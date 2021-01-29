import {ArgsOf, Guard, On} from "@typeit/discord";
import {NotBotMessage} from "../guards/NotBot";
import {curseService} from "../services/CurseService";
import {CursePOJO} from "../pojo/CursePOJO";
import {Message} from "discord.js";
import {onlineTimeService} from "../services/OnlineTimeService";
import {UserPOJO} from "../pojo/UserPOJO";
import {DateTime} from "luxon";
import {DATE_FORMAT, LOGGER} from "../utils/constants";


export abstract class EMessage {
    readonly emojis: string[] = ["0️⃣", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"]
    readonly replies: string[] = [
        "are you okay? Been swearing a lot 😇",
        "working on that curse count I see?",
        "wow.",
    ]
    lastReplyIndex;

    @On("message")
    @Guard(NotBotMessage)
    async message([message]: ArgsOf<"message">): Promise<void> {
        await this.handleCursing(message);
        await this.handleMessageCount(message);
    }

    private async handleCursing(message: Message): Promise<void> {
        const curseCount = curseService.getCurseCount(message.content);
        const user = await curseService.findOne({userid: message.author.id,});

        if (user) {
            // For backwards compatibleness
            if (!user.countPerDays) user.countPerDays = []
            const today = user.countPerDays.find(day => day.date === DateTime.local().toFormat(DATE_FORMAT));

            if (!today) user.countPerDays.push({date: DateTime.local().toFormat(DATE_FORMAT), count: curseCount});
            else today.count += curseCount;

            curseService.update({userid: message.author.id}, user);
        } else {
            curseService.insert(new CursePOJO(message.author.username, message.author.id, 0, [
                {
                    date: DateTime.local().toFormat(DATE_FORMAT),
                    count: curseCount
                }]
            ));
        }

        if (curseCount > 1) {
            const numbers = this.convertToDigits(curseCount);
            try {
                for (const number of numbers) {
                    await message.react(this.emojis[number]);
                }
            } catch (e) {
                LOGGER.error(`${e.message} || ${e.stack}`)
            }
        }

        if (curseCount > 5) {
            let randomReplyIndex = Math.floor(Math.random() * this.replies.length);
            while (randomReplyIndex == this.lastReplyIndex) {
                randomReplyIndex = Math.floor(Math.random() * this.replies.length);
            }
            this.lastReplyIndex = randomReplyIndex;
            await message.reply(this.replies[randomReplyIndex])
        }
    }

    private async handleMessageCount(message: Message): Promise<void> {
        const user = await onlineTimeService.findOne({userid: message.author.id});
        if (user) {
            const todayObject = user.countPerDays.find(day => day.date === DateTime.local().toFormat(DATE_FORMAT));
            if (todayObject) todayObject.count++;
            else user.countPerDays.push({date: DateTime.local().toFormat(DATE_FORMAT), count: 1})
            onlineTimeService.update({userid: user.userid}, user);
        } else if (onlineTimeService.isOnline(message.author.presence)) {
            onlineTimeService.insert(new UserPOJO(message.author.username, message.author.username, [{
                lastJoined: DateTime.local().toISO(),
                isOnline: true,
                minutes: 0
            }], 0, 0, 0, [{date: DateTime.local().toFormat(DATE_FORMAT), count: 1}], 0, []))
        }
    }

    private convertToDigits(number: number): number[] {
        const output = [], stringNumber = number.toString();

        for (let i = 0, len = stringNumber.length; i < len; i += 1) {
            output.push(+stringNumber.charAt(i));
        }
        return output;
    }
}
