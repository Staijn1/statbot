import {Command, CommandMessage, Description, Guard} from "@typeit/discord";
import {NotBotMessage} from "../../guards/NotBot";
import {IsAdmin} from "../../guards/IsAdmin";
import {CREATE_DEFAULT_EMBED} from "../../constants";
import {curseService} from "../../services/CurseService";

export abstract class ReloadCurseWords {

    @Command("reloadCurse")
    @Description("Admins only. Reloads the cursewords")
    @Guard(NotBotMessage, IsAdmin)
    reloadCurseFile(message: CommandMessage): void {
        curseService.loadWords();
        const response = CREATE_DEFAULT_EMBED("Success", "Successfully reload the curse list!")
        message.channel.send(response);
    }
}
