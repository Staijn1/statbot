import {Command, CommandMessage, Guard, Infos} from "@typeit/discord";
import {NotBotMessage} from "../../guards/NotBot";
import {IsAdminWithResponse} from "../../guards/IsAdminWithResponse";
import {onlineTimeService} from "../../services/OnlineTimeService";
import {CREATE_DEFAULT_EMBED} from "../../utils/Functions";

export abstract class GetInactiveUsers {

    @Command("inactive")
    @Infos({
        description: "Get a list of inactive users.",
        page: 3,
        admin: true
    })
    @Guard(NotBotMessage, IsAdminWithResponse)
    async getInactive(message: CommandMessage): Promise<void> {
        const responseEmbed = CREATE_DEFAULT_EMBED("List of all most inactive users", "Users gain \"inactivity warnings\" if they send few messages in one month.\nThey can gain a buffer by being active. A high positive number means lots of inactivity. You can gain or lose one warning a month");
        const inactiveMembers = await onlineTimeService.getTopInactiveMembers();

        inactiveMembers.forEach((user, index) => {
            if (user.inactiveWarnings > 0) responseEmbed.addField(`${index + 1}. ${user.username}`, `${user.inactiveWarnings} warning(s)`)
        })

        await message.channel.send(responseEmbed);
    }
}
