import {Client, Command, CommandInfos, CommandMessage, Description} from "@typeit/discord";
import {MessageEmbed, Permissions} from "discord.js";
import {DEFAULT_COLOR} from "../utils/constants";

export abstract class Help {
    @Command("help")
    @Description("get some help.")
    async help(message: CommandMessage): Promise<void> {
        const embed = new MessageEmbed()
            // Set the title of the field
            .setTitle('Help')
            // Set the color of the embed
            .setColor(DEFAULT_COLOR)
            // Set the main content of the embed
            .setDescription('Here is your help, son')

        const guildMember = message.guild.members.cache.get(message.author.id);
        const permissions = guildMember.permissions.bitfield;
        const permissionToCheck = Permissions.FLAGS.BAN_MEMBERS;

        const isMod = (permissions & permissionToCheck) === permissionToCheck;

        let commands;
        if (isMod) {
            commands = this.handleModHelp();
        } else {
            commands = this.handleUserHelp();
        }

        commands.sort(((a, b) => {
            const textA = (a.commandName as string).toUpperCase();
            const textB =  (b.commandName as string).toUpperCase();
            return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        }));

        for (const command of commands) {
            embed.addField(`${command.prefix}${command.commandName}`, command.description, false)
        }

        await message.channel.send(embed);
    }

    private handleModHelp(): CommandInfos<unknown>[] {
        return Client.getCommands();
    }

    private handleUserHelp(): CommandInfos<unknown>[] {
        return Client.getCommands().filter(command => !command.infos.forAdmins)
    }
}
