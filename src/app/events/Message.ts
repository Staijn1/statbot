import {ArgsOf, Guard, On} from "@typeit/discord";
import {curseService} from "../services/CurseService";
import {NotBotMessage} from "../guards/NotBot";
import {saveService} from "../services/SaveService";


export abstract class EMessage {
    // The emoji number will correspond with the index its in. index 0 is emoji 0
    @On("message")
    @Guard(NotBotMessage)
    async message([message]: ArgsOf<"message">): Promise<void> {
        let curseCount = 0;
        for (const curseWord of curseService.curseWords) {
            curseCount += curseService.occurrences(message.content.toLowerCase(), curseWord.toLowerCase(), false);
        }

        const user = saveService.findUserActivity(message.author.id);
        user.curseCount += curseCount;
        user.messagesSent++;
        saveService.updateUserActivity(user);

        if (curseCount > 5) {
            await message.reply("are you okay?")
        }
    }
}
