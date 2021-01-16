import {ArgsOf, Guard, On} from "@typeit/discord";
import {curseService} from "../services/CurseService";
import {NotBotMessage} from "../guards/NotBot";
import {saveService} from "../services/SaveService";


export abstract class EMessage {
    @On("message")
    @Guard(NotBotMessage)
    message([message]: ArgsOf<"message">): void {
        let curseCount = 0;
        for (const curseWord of curseService.curseWords) {
            curseCount += curseService.occurrences(message.content.toLowerCase(), curseWord.toLowerCase(), false);
        }
        const user = saveService.findUserActivity(message.author.id);
        user.curseCount += curseCount;
        saveService.updateUserActivity(user);

        if (curseCount > 5) {
            message.reply("are you okay?")
        }
    }
}
