import {Command, CommandMessage, Description, Guard} from "@typeit/discord";
import {NotBotMessage} from "../../guards/NotBot";
import {IsAdmin} from "../../guards/IsAdmin";
import {CREATE_DEFAULT_EMBED} from "../../constants";
import {onlineTimeService} from "../../services/OnlineTimeService";

export abstract class GetInactiveUsers {

    @Command("inactive")
    @Description(`Admins only. Get a list of inactive users.`)
    @Guard(NotBotMessage, IsAdmin)
    async getInactive(message: CommandMessage): Promise<void> {
        const responseEmbed = CREATE_DEFAULT_EMBED("List of all most inactive users", "Users gain \"inactivity warnings\" if they send few messages in one month.\nThey can gain a buffer by being active. A high positive number means lots of inactivity. You can gain or lose one warning a month");
        const inactiveMembers = await onlineTimeService.getTopInactiveMembers();

        inactiveMembers.forEach((user, index) => {
            if (user.inactiveWarnings > 0) responseEmbed.addField(`${index + 1}. ${user.username}`, `${user.inactiveWarnings} warning(s)`)
        })

        await message.channel.send(responseEmbed);
    }
}
