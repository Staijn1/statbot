import {Client, Command, CommandMessage, Infos} from "@typeit/discord";
import {MessageEmbed} from "discord.js";
import {CREATE_DEFAULT_EMBED, CREATE_ERROR_EMBED, isModBasedOnMessage} from "../utils/functions";

export abstract class Help {
    /*
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
     */

    @Command("help :page")
    @Infos({description: "get some help.", show: false, page: 0})
    async help(command: CommandMessage): Promise<void> {
        let response = CREATE_DEFAULT_EMBED("Statbot Commands", "Get help for the commands here!")
        let page;

        if (command.args.page && typeof command.args.page == "number") {
            page = command.args.page;
        } else {
            page = 0;
        }

        if (page === 3 && !isModBasedOnMessage(command)) {
            response = CREATE_ERROR_EMBED("Error!", "Sorry you do not have access to view this page!");
            await command.channel.send(response);
            return;
        }


        const availableCommands = Client.getCommands().filter(registeredCommand => registeredCommand.infos.page === page);
        if (page == 0) response = this.showDefaultPage(command);
        else {
            for (const availableCommand of availableCommands) {
                response.addField(`${availableCommand.prefix}${availableCommand.commandName}`, availableCommand.description)
            }
        }


        await command.channel.send(response);
    }

    private showDefaultPage(message: CommandMessage): MessageEmbed {
        const messageEmbed = CREATE_DEFAULT_EMBED("StatBot Help", "Get some help here. Categories:");
        messageEmbed.addFields([
            {
                name: ':level_slider: General statistics ── ``page 1``',
                value: "Some general statistics, like curse count or top online users"
            },
            {
                name: ':chart_with_upwards_trend: Charts ── ``page 2``',
                value: "Some general statistics, like curse count or top online users"
            },
        ]);

        if (isModBasedOnMessage(message)) messageEmbed.addField(":tools: Admin commands ── ``page 3``", "These commands are for admins only\n\n");

        return messageEmbed;
    }
}
