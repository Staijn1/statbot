import {Command, CommandMessage, Infos} from "@typeit/discord";
import {LOGGER} from "../../utils/constants";
import {onlineTimeService} from "../../services/OnlineTimeService";
import {CREATE_DEFAULT_EMBED} from "../../utils/functions";
import {Duration} from "luxon";

export abstract class GetTopActiveUsers {
    @Command("topvoicechat")
    @Infos({
        description: "Get the top users in voicechat, of all time",
        page: 1,
        admin: false
    })
    async showTopVoiceChatUsers(message: CommandMessage): Promise<void> {
        const embed = CREATE_DEFAULT_EMBED("Top 10 Users In Voicechat", "The total amount of time spent in voicechat. Times are inaccurate when people are still in voicechat!")
        const users = await onlineTimeService.findAll();
        users.forEach(user => {
            //todo implement for voicechat minutes
            onlineTimeService.updateOnlineTimeOnlineUser(user, user.minutesOnlinePerDay[user.minutesOnlinePerDay.length - 1].isOnline);
        });
        let sortedUsers = await onlineTimeService.getMostInVoicechatAllTime();
        sortedUsers = sortedUsers.slice(0, 10)

        if (sortedUsers.length > 0) {
            try {
                const guildMember = message.guild.members.cache.get(sortedUsers[0].userid);
                embed.setThumbnail(guildMember.user.displayAvatarURL());
            } catch (e) {
                LOGGER.error(`${e.message} || ${e.stack}`)
            }
        }

        for (let i = 0; i < sortedUsers.length; i++) {
            const user = sortedUsers[i];
            const formattedTime = Duration.fromObject({minutes: Math.floor(user.vcMinutesAllTime)}).toFormat(("y 'years' d 'days' h 'hours' m 'minutes"));
            embed.addField(`${i + 1}. ${user.username}`, formattedTime);
        }

        const author = await onlineTimeService.findOne({userid: message.author.id});
        if (!author || !author.vcCountPerDay) {
            embed.setFooter("Sorry your voicechat time could not be loaded.");
        } else {
            author.vcCountPerDay.forEach(day => {
                if (!author.vcMinutesAllTime) author.vcMinutesAllTime = 0;
                author.vcMinutesAllTime += day.minutes;
            })
            const formattedTime = Duration.fromObject({minutes: Math.floor(author.vcMinutesAllTime)}).toFormat(("y 'years' d 'days' h 'hours' m 'minutes"));
            const position = sortedUsers.findIndex(user => user.userid === message.author.id);
            embed.setFooter(`You have been in voicechat for ${formattedTime}.\nPosition: ${position + 1}`);
        }

        await message.channel.send(embed);
    }
}
