import {Command, CommandMessage, Description} from "@typeit/discord";
import {CREATE_DEFAULT_EMBED, LOGGER} from "../utils/constants";
import {onlineTimeService} from "../services/OnlineTimeService";
import {Duration} from "luxon";

export abstract class GetTopOnlineUsers {

    @Command("topOnline")
    @Description("get the top online users. losers.")
    async showTop10OnlineUsers(message: CommandMessage): Promise<void> {
        const embed = CREATE_DEFAULT_EMBED("Top 10 Online Users", "Times are sum of all online time");
        const users = await onlineTimeService.find();
        users.forEach(user => {
            onlineTimeService.updateOnlineTimeOnlineUser(user);
        });
        const sortedUsers = await onlineTimeService.getTopOnline();

        if (sortedUsers.length > 0) {
            try {
                const member = await message.guild.members.cache.get(sortedUsers[0].userid);
                embed.setThumbnail(member.user.displayAvatarURL());
            } catch (e) {
                LOGGER.error(`${e.message} || ${e.stack}`)
            }
        }

        for (let i = 0; i < sortedUsers.length; i++) {
            const user = sortedUsers[i];
            const formattedTime = Duration.fromObject({minutes: Math.floor(user.totalMinutesOnline)}).toFormat(("y 'years' d 'days' h 'hours' m 'minutes"));
            embed.addField(`${i + 1}. ${user.username}`, formattedTime);
        }

        const author = await onlineTimeService.findOne({userid: message.author.id});
        if (!author) {
            embed.setFooter("Sorry your online time could not be loaded.");
        } else {
            const formattedTime = Duration.fromObject({minutes: Math.floor(author.totalMinutesOnline)}).toFormat(("y 'years' d 'days' h 'hours' m 'minutes"));
            const position = sortedUsers.findIndex(user => user.userid === message.author.id);
            embed.setFooter(`You have been online for ${formattedTime}.\nPosition: ${position + 1}`);
        }

        await message.channel.send(embed);
    }
}
