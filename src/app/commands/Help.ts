import {Client, Command, CommandMessage, Description} from "@typeit/discord";
import {MessageEmbed} from "discord.js";
import {DEFAULT_COLOR} from "../constants";

export abstract class Help {
    @Command("help")
    @Description("get some help.")
    help(message: CommandMessage): void {
        const embed = new MessageEmbed()
            // Set the title of the field
            .setTitle('Help')
            // Set the color of the embed
            .setColor(DEFAULT_COLOR)
            // Set the main content of the embed
            .setDescription('Here is your help, son')

        const commands = Client.getCommands();
        commands.sort(((a, b) => {
            const textA = (a.commandName as string).toUpperCase();
            const textB =  (b.commandName as string).toUpperCase();
            return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        }))
        for (const command of commands) {
            embed.addField(`${command.prefix}${command.commandName}`, command.description, false)
        }
        message.channel.send(embed);
    }
}
