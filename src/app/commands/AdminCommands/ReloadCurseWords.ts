import {Command, CommandMessage, Description, Guard, Infos} from "@typeit/discord";
import {NotBotMessage} from "../../guards/NotBot";
import {IsAdminWithResponse} from "../../guards/IsAdminWithResponse";
import {CREATE_DEFAULT_EMBED, TIMEOUT} from "../../utils/constants";
import {curseService} from "../../services/CurseService";

export abstract class ReloadCurseWords {

    @Command("reloadCurse")
    @Infos({forAdmins: true, description: "Reloads the cursewords"})
    @Guard(NotBotMessage, IsAdminWithResponse)
    reloadCurseFile(message: CommandMessage): void {
        curseService.loadWords();
        const response = CREATE_DEFAULT_EMBED("Success", "Successfully reload the curse list!")
        message.channel.send(response).then(response => {
            message.delete({timeout: TIMEOUT})
            response.delete({timeout: TIMEOUT})
        });
    }
}
