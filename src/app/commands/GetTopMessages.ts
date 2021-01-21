import {Command, CommandMessage, Description} from "@typeit/discord";
import {CREATE_DEFAULT_EMBED, LOGGER} from "../utils/constants";
import {onlineTimeService} from "../services/OnlineTimeService";

export abstract class GetTopActiveUsers {

    @Command("topactive")
    @Description("Get the top active users based on messages.")
    async showTopActiveUsers(message: CommandMessage): Promise<void> {
        const embed = CREATE_DEFAULT_EMBED("Top 10 Active Users", "The count of messages in this month.")
        const users = await onlineTimeService.findMostActiveUsers();

        const user = await message.guild.members.cache.get(users[0].userid);
        try {
            embed.setThumbnail(user.user.displayAvatarURL());
        } catch (e) {
            LOGGER.error(`${e.message} || ${e.stack}`)
        }

        for (let i = 0; i < users.length; i++) {
            const user = users[i];
            embed.addField(`${i + 1}. ${user.username}`, `${user.messagesSent} messages sent`);
        }

        const author = await onlineTimeService.findOne({userid: message.author.id});
        if (!author) {
            embed.setFooter("Sorry your message count could not be loaded.");
        } else {
            const position = users.findIndex(user => user.userid === message.author.id);
            embed.setFooter(`You have sent ${author.messagesSent} messages this month.\nPosition: ${position + 1}`);
        }

        await message.channel.send(embed);
    }
}
