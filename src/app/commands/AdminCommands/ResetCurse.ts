import {Command, CommandMessage, Guard, Infos} from "@typeit/discord";
import {NotBotMessage} from "../../guards/NotBot";
import {IsAdminWithResponse} from "../../guards/IsAdminWithResponse";
import {PREFIX, TIMEOUT} from "../../utils/constants";
import {MessageEmbed} from "discord.js";
import {curseService} from "../../services/CurseService";
import {CREATE_DEFAULT_EMBED, CREATE_ERROR_EMBED, getUserId} from "../../utils/functions";

export abstract class ResetCurse {

    responseEmbed: MessageEmbed;

    @Command("resetcurse :username :amount")
    @Infos({
        description: `Resets the curse counter. Formats:\n${PREFIX}resetCurse | Resets all users curse stats\n${PREFIX}resetCurse @User | Resets the user curse count to 0\n${PREFIX}resetCurse @User 100 | Sets user to 100`,
        admin: true,
        page: 3,
    })
    @Guard(NotBotMessage, IsAdminWithResponse)
    async resetCurse(message: CommandMessage): Promise<void> {
        this.responseEmbed = CREATE_DEFAULT_EMBED("Success", "Altered curse count succesfully!");
        if (message.args.length > 2) {
            this.responseEmbed = CREATE_ERROR_EMBED('Error!', `Invalid amount or order of parameters! Use ${PREFIX}help for help`)
        }

        // No parameter is supplied if this is true. Reset all cursecounts.
        if (!message.args.username && !message.args.amount) {

            const users = await curseService.findAll();
            users.forEach(user => {
                user.curseCountAllTime = 0;
                user.countPerDays = []
                curseService.update({userid: user.userid}, user);
            });

        } else if (message.args.username && !message.args.amount && typeof message.args.username === "string") {
            await this.updateUser(message, 0);
        } else if (message.args.username && message.args.amount && typeof message.args.username === "string" && typeof message.args.amount === 'number') {
            await this.updateUser(message, message.args.amount);
        } else {
            this.responseEmbed = CREATE_ERROR_EMBED('Error!', `Invalid amount or order of parameters! Use ${PREFIX}help for help`);
        }

        const sentMessage = await message.channel.send(this.responseEmbed)
        await message.delete({timeout: TIMEOUT});
        await sentMessage.delete({timeout: TIMEOUT});
    }

    private async updateUser(message: CommandMessage, amount: number): Promise<void> {
        const user = await curseService.findOne({userid: getUserId(message.args.username)});
        if (user) {
            user.curseCountAllTime = amount;
            user.countPerDays = []
            curseService.update({userid: user.userid}, user);
        } else {
            this.responseEmbed = CREATE_ERROR_EMBED("Error!", "User not found!")
        }
    }
}
