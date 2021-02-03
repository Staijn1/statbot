import {Command, CommandMessage, Infos} from "@typeit/discord";
import {LOGGER} from "../../utils/constants";
import {onlineTimeService} from "../../services/OnlineTimeService";
import {CREATE_DEFAULT_EMBED} from "../../utils/functions";

export abstract class GetTopActiveUsers {
    @Command("topmessages")
    @Infos({
        description: "Get the top users based on messages, of all time",
        page: 1,
        admin: false
    })
    async showTopActiveUsers(message: CommandMessage): Promise<void> {
        const embed = CREATE_DEFAULT_EMBED("Top 10 Active Users", "The count of messages of all time")
        const allUsers = await onlineTimeService.getMostMessagersAllTime();
        const top10users = allUsers.slice(0, 10);
        const guildUser = message.guild.members.cache.get(top10users[0].userid);
        try {
            embed.setThumbnail(guildUser.user.displayAvatarURL());
        } catch (e) {
            LOGGER.error(`${e.message} || ${e.stack}`)
        }

        for (let i = 0; i < top10users.length; i++) {
            const user = top10users[i];
            embed.addField(`${i + 1}. ${user.username}`, `${user.messagesSentAllTime} messages sent`);
        }

        const author = await onlineTimeService.findOne({userid: message.author.id});
        if (!author) {
            embed.setFooter("Sorry your message count could not be loaded.");
        } else {
            let messagesThisMonth = 0;
            author.countPerDays.forEach(day => messagesThisMonth += day.count)
            const position = allUsers.findIndex(user => user.userid === message.author.id);
            embed.setFooter(`You have sent ${author.messagesSentAllTime + messagesThisMonth} messages\nPosition: ${position + 1}`);
        }

        await message.channel.send(embed);
    }
}
