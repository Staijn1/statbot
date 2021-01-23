import {Command, CommandMessage, Guard, Infos} from "@typeit/discord";
import {NotBotMessage} from "../../guards/NotBot";
import {IsAdminWithResponse} from "../../guards/IsAdminWithResponse";
import {TIMEOUT} from "../../utils/constants";
import {curseService} from "../../services/CurseService";
import {CREATE_DEFAULT_EMBED} from "../../utils/functions";

export abstract class ReloadCurseWords {

    @Command("reloadcurse")
    @Infos({
        description: "Reloads the list of cursewords that get checked",
        page: 3,
        admin: true
    })
    @Guard(NotBotMessage, IsAdminWithResponse)
    async reloadCurseFile(message: CommandMessage): Promise<void> {
        curseService.loadWords();
        const responseToSend = CREATE_DEFAULT_EMBED("Success", "Successfully reload the curse list!")
        const responseSent = await message.channel.send(responseToSend);
        setTimeout(async () => {
            await message.delete();
            await responseSent.delete();
        }, TIMEOUT);
    }
}
