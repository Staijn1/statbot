import {Command, CommandMessage, Guard, Infos} from "@typeit/discord";
import {NotBotMessage} from "../../guards/NotBot";
import {IsAdminWithResponse} from "../../guards/IsAdminWithResponse";
import {LOGGER, PREFIX, TIMEOUT} from "../../utils/constants";
import {MessageEmbed} from "discord.js";
import {curseService} from "../../services/CurseService";
import {CREATE_DEFAULT_EMBED, CREATE_ERROR_EMBED, getUserId} from "../../utils/functions";
import {onlineTimeService} from "../../services/OnlineTimeService";
import {DateTime} from "luxon";

export abstract class ResetVCTime {
  responseEmbed: MessageEmbed;

  @Command("resetonlinetime :time")
  @Infos({
    description: `Resets ALL online time minutes of everyone Formats:\n${PREFIX}resetvctime all | Resets all voicechat minutes ever\n${PREFIX}resetvctime month | Resets the user voicechat minutes only for this month`,
    admin: true,
    page: 3,
  })
  @Guard(NotBotMessage, IsAdminWithResponse)
  async resetCurse(message: CommandMessage): Promise<void> {
    const currentGuild = await message.client.guilds.fetch(message.guild.id);

    this.responseEmbed = CREATE_DEFAULT_EMBED("Success", "Reset all user online time minutes");


    if (message.args.length !== 1 && message.args.time !== 'all' && message.args.time !== 'month') {
      this.responseEmbed = CREATE_ERROR_EMBED('Error!', `Invalid parameters! Use ${PREFIX}help for help`)
      await message.channel.send(this.responseEmbed);
      return;
    }

    const allUsers = await onlineTimeService.findAll();

    for (const user of allUsers) {
      try {
        const discordUser = await currentGuild.members.cache.get(user.userid)
        user.minutesOnlinePerDay = [{
          lastJoined: DateTime.local().toISO(),
          minutes: 0,
          isOnline: onlineTimeService.isOnline(discordUser.presence)
        }];

        if (message.args.time === 'all') {
          user.totalMinutesOnlineAllTime = 0;
        }
        onlineTimeService.update({userid: user.userid}, user);
      } catch (e) {
        LOGGER.error(`${e.message} || ${e.stack}`)
      }
    }

    const sentMessage = await message.channel.send(this.responseEmbed)
    await message.delete({timeout: TIMEOUT});
    await sentMessage.delete();
  }
}
