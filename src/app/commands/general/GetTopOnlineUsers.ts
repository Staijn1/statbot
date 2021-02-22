import {Command, CommandMessage, Infos} from "@typeit/discord";
import {CREATE_CONSTRUCTION_EMBED, CREATE_DEFAULT_EMBED} from "../../utils/functions";
import {onlineTimeService} from "../../services/OnlineTimeService";
import {LOGGER} from "../../utils/constants";
import {Duration} from "luxon";

export abstract class GetTopOnlineUsers {
  @Command("toponline")
  @Infos({
    description: "Get the top online users of all time",
    page: 1,
    admin: false
  })
  async showTop10OnlineUsers(message: CommandMessage): Promise<void> {

    const embed = CREATE_DEFAULT_EMBED("Top 10 Online Users", "Times are sum of all online time, all time");
    const topOnlineMembersAllTime = await onlineTimeService.getTopOnlineMembersAllTime();
    try {
      const guildMember = message.guild.members.cache.get(topOnlineMembersAllTime[0].userid);
      embed.setThumbnail(guildMember.user.displayAvatarURL());
    } catch (e) {
      LOGGER.error(`${e.message} || ${e.stack}`)
    }

    for (let i = 0; i < topOnlineMembersAllTime.slice(0, 10).length; i++) {
      const user = topOnlineMembersAllTime[i];
      const formattedTime = Duration.fromObject({minutes: Math.floor(user.totalMinutesOnlineAllTime)}).toFormat(("y 'years' d 'days' h 'hours' m 'minutes"));
      embed.addField(`${i + 1}. ${user.username}`, formattedTime);
    }

    const author = await onlineTimeService.findOne({userid: message.author.id});
    if (!author) {
      embed.setFooter("Sorry your online time could not be loaded.");
    } else {
      const position = topOnlineMembersAllTime.findIndex(user => user.userid === message.author.id);
      const minutesSpent = topOnlineMembersAllTime[position].totalMinutesOnlineAllTime;
      const formattedTime = Duration.fromObject({minutes: Math.floor(minutesSpent)}).toFormat(("y 'years' d 'days' h 'hours' m 'minutes"));
      embed.setFooter(`You have been online for ${formattedTime}.\nPosition: ${position + 1}`);
    }


    await message.channel.send(embed)
  }
}
