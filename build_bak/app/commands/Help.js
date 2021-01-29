"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Help = void 0;
const tslib_1 = require("tslib");
const discord_1 = require("@typeit/discord");
const functions_1 = require("../utils/functions");
class Help {
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
    async help(command) {
        let response = functions_1.CREATE_DEFAULT_EMBED("Statbot Commands", "Get help for the commands here!");
        let page;
        if (command.args.page && typeof command.args.page == "number") {
            page = command.args.page;
        }
        else {
            page = 0;
        }
        if (page === 3 && !functions_1.isModBasedOnMessage(command)) {
            response = functions_1.CREATE_ERROR_EMBED("Error!", "Sorry you do not have access to view this page!");
            await command.channel.send(response);
            return;
        }
        const availableCommands = discord_1.Client.getCommands().filter(registeredCommand => registeredCommand.infos.page === page);
        if (page == 0)
            response = this.showDefaultPage(command);
        else {
            for (const availableCommand of availableCommands) {
                response.addField(`${availableCommand.prefix}${availableCommand.commandName}`, availableCommand.description);
            }
        }
        await command.channel.send(response);
    }
    showDefaultPage(message) {
        const messageEmbed = functions_1.CREATE_DEFAULT_EMBED("StatBot Help", "Get some help here. Categories:");
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
        if (functions_1.isModBasedOnMessage(message))
            messageEmbed.addField(":tools: Admin commands ── ``page 3``", "These commands are for admins only\n\n");
        return messageEmbed;
    }
}
tslib_1.__decorate([
    discord_1.Command("help :page"),
    discord_1.Infos({ description: "get some help.", show: false, page: 0 }),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [discord_1.CommandMessage]),
    tslib_1.__metadata("design:returntype", Promise)
], Help.prototype, "help", null);
exports.Help = Help;
//# sourceMappingURL=Help.js.map