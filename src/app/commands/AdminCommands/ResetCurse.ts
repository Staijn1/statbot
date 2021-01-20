import {Command, CommandMessage, Description, Guard} from "@typeit/discord";
import {NotBotMessage} from "../../guards/NotBot";
import {IsAdmin} from "../../guards/IsAdmin";
import {CREATE_DEFAULT_EMBED, CREATE_ERROR_EMBED, LOGGER, PREFIX, TIMEOUT} from "../../constants";
import {MessageEmbed} from "discord.js";
import {curseService} from "../../services/CurseService";

export abstract class ResetCurse {

    responseEmbed: MessageEmbed;

    @Command("resetCurse :username :amount")
    @Description(`Admins only. Resets the curse counter.
     Formats:\n
     ${PREFIX}resetCurse | Resets all users curse stats\n
     ${PREFIX}resetCurse @User | Resets the user curse count to 0\n
     ${PREFIX}resetCurse @User 100 | Sets user to 100`)
    @Guard(NotBotMessage, IsAdmin)
    async resetCurse(message: CommandMessage): Promise<void> {
        this.responseEmbed = CREATE_DEFAULT_EMBED("Success", "Altered curse count succesfully!");
        if (message.args.length > 2) {
            this.responseEmbed = CREATE_ERROR_EMBED('Error!', `Invalid amount or order of parameters! Use ${PREFIX}help for help`)
        }

        // No parameter is supplied if this is true. Reset all cursecounts.
        if (!message.args.username && !message.args.amount) {

            const users = await curseService.find();
            users.forEach(user => {
                user.curseCount = 0;
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
        const user = await curseService.findOne({userid: this.getUserId(message.args.username)});
        if (user) {
            user.curseCount = amount;
            curseService.update({userid: user.userid}, user);
        } else {
            this.responseEmbed = CREATE_ERROR_EMBED("Error!", "User not found!")
        }
    }

    /**
     * Filter out the <@! and > in the strings, leaving only numbers (userid). Join them from one array into a string
     * @param garbledUserId - The garbled userid to format
     */
    getUserId(garbledUserId: string): string {
        try {
            return garbledUserId.match(/\d/g).join("");
        } catch (e) {
            LOGGER.error(`${e.message} || ${e.stack}`)
            return undefined;
        }
    }
}
