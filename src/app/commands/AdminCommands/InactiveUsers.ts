import {Command, CommandMessage, Description, Guard} from "@typeit/discord";
import {NotBotMessage} from "../../guards/NotBot";
import {IsAdmin} from "../../guards/IsAdmin";
import {CREATE_DEFAULT_EMBED} from "../../constants";
import {saveService} from "../../services/SaveService";

export abstract class GetInactiveUsers {

    @Command("inactive")
    @Description(`Admins only. Get a list of inactive users.`)
    @Guard(NotBotMessage, IsAdmin)
    async getInactive(message: CommandMessage): Promise<void> {
        const responseEmbed = CREATE_DEFAULT_EMBED("List of all most inactive users", "Users gain \"inactivity warnings\" if they send few messages in one month.\nThey can gain a buffer by being active. A high positive number means lots of inactivity, a negative number is an active user.");


        saveService.sort((a, b) => {
            if (a.inactiveWarnings < b.inactiveWarnings) return 1;
            if (a.inactiveWarnings > b.inactiveWarnings) return -1;
            return 0;
        });
        saveService.users.forEach((user, index) => {
            if (user.inactiveWarnings > 0) responseEmbed.addField(`${index + 1}. ${user.username}`, `${user.inactiveWarnings} warnings`)
        })

        await message.channel.send(responseEmbed);
    }
}
