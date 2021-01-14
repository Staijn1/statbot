import {Client, Command, CommandMessage, Description} from "@typeit/discord";
import {MessageEmbed} from "discord.js";
import {color} from "../constants";

export abstract class Help {
    @Command("help")
    @Description("get some help.")
    help(message: CommandMessage): void {
        const embed = new MessageEmbed()
            // Set the title of the field
            .setTitle('Help')
            // Set the color of the embed
            .setColor(color)
            // Set the main content of the embed
            .setDescription('heres your help son')

        for (const command of Client.getCommands()) {
            embed.addField(`${command.prefix}${command.commandName}`, command.description, false)
        }
        message.channel.send(embed);
    }
}
