import {Command, CommandMessage, Description, Guard} from "@typeit/discord";
import {NotBotMessage} from "../../guards/NotBot";
import {IsAdmin} from "../../guards/IsAdmin";
import {CREATE_DEFAULT_EMBED, CREATE_ERROR_EMBED, LOGGER, PREFIX} from "../../constants";
import {saveService} from "../../services/SaveService";
import {MessageEmbed} from "discord.js";

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
            saveService.users.forEach(user => user.curseCount = 0);
            saveService.updateAllUserActivity();
        } else if (message.args.username && !message.args.amount && typeof message.args.username === "string") {
            this.updateUser(message, 0);
        } else if (message.args.username && message.args.amount && typeof message.args.username === "string" && typeof message.args.amount === 'number') {
            this.updateUser(message, message.args.amount);
        } else {
            this.responseEmbed = CREATE_ERROR_EMBED('Error!', `Invalid amount or order of parameters! Use ${PREFIX}help for help`);
        }

        const sentMessage = await message.channel.send(this.responseEmbed)
        setTimeout(async () => {
            await message.delete();
            await sentMessage.delete();
        }, 1000);
    }

    private updateUser(message: CommandMessage, amount: number): void {
        const foundUser = saveService.findUserActivity(this.getUserId(message.args.username));
        // If the user is not found, send error
        if (!foundUser) {
            this.responseEmbed = CREATE_ERROR_EMBED("Error!", "User not found!")
        } else {
            foundUser.curseCount = amount;
            saveService.updateUserActivity(foundUser);
        }
    }

    /**
     * Filter out the <@! and > in the strings, leaving only numbers (userid). Join them from one array into a string
     * @param garbledUserId - The garbled userid to format
     */
    getUserId(garbledUserId: string) {
        try {
            return garbledUserId.match(/\d/g).join("");
        } catch (e) {
            LOGGER.error(`${e.message} || ${e.stack}`)
            return undefined;
        }
    }
}
