import {ArgsOf, Guard, On} from "@typeit/discord";
import {NotBotMessage} from "../guards/NotBot";
import {curseService} from "../services/CurseService";
import {CursePOJO} from "../pojo/CursePOJO";
import {Message} from "discord.js";
import {onlineTimeService} from "../services/OnlineTimeService";
import {UserPOJO} from "../pojo/UserPOJO";
import {DateTime} from "luxon";


export abstract class EMessage {
    @On("message")
    @Guard(NotBotMessage)
    async message([message]: ArgsOf<"message">): Promise<void> {
        await this.handleCursing(message);
        await this.handleMessageCount(message);
    }

    private async handleCursing(message: Message): Promise<void> {
        const curseCount = curseService.getCurseCount(message.content);
        const user = await curseService.findOne({userid: message.author.id});

        if (user) {
            user.curseCount += curseCount;
            curseService.update({userid: message.author.id}, user);
        } else {
            curseService.insert(new CursePOJO(message.author.username, message.author.id, curseCount));
        }

        if (curseCount > 5) {
            await message.reply("are you okay? Been swearing a lot lol.")
        }
    }

    private async handleMessageCount(message: Message): Promise<void> {
        const user = await onlineTimeService.findOne({userid: message.author.id});
        if (user) {
            user.messagesSent++;
            await onlineTimeService.update({userid: user.userid}, user);
        } else if (onlineTimeService.isOnline(message.author.presence)) {
            await onlineTimeService.insert(new UserPOJO(message.author.username, message.author.username, 0, DateTime.local().toISO(), true, 1, 0))
        }
    }
}
