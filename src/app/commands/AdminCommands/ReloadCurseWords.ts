import {Command, CommandMessage, Description, Guard} from "@typeit/discord";
import {NotBotMessage} from "../../guards/NotBot";
import {IsAdmin} from "../../guards/IsAdmin";
import {MessageEmbed} from "discord.js";
import {DEFAULT_COLOR} from "../../constants";
import {curseService} from "../../services/CurseService";

export abstract class ReloadCurseWords {

    @Command("reloadCurse")
    @Description("Admins only. Reloads the cursewords")
    @Guard(NotBotMessage, IsAdmin)
    reloadCurseFile(message: CommandMessage): void {
        curseService.loadWords();
        const response = new MessageEmbed().setTitle("Succes").setDescription("Succesfully reloaded the curse list!").setColor(DEFAULT_COLOR)
        message.channel.send(response);
    }
}
