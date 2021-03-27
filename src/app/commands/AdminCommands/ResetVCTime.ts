import {Command, CommandMessage, Guard, Infos} from "@typeit/discord";
import {NotBotMessage} from "../../guards/NotBot";
import {IsAdminWithResponse} from "../../guards/IsAdminWithResponse";
import {PREFIX, TIMEOUT} from "../../utils/constants";
import {MessageEmbed} from "discord.js";
import {CREATE_DEFAULT_EMBED, CREATE_ERROR_EMBED} from "../../utils/functions";
import {onlineTimeService} from "../../services/OnlineTimeService";
import {DateTime} from "luxon";

export abstract class ResetVCTime {
  responseEmbed: MessageEmbed;

  @Command("resetvctime :time")
  @Infos({
    description: `Resets ALL voicechat minutes of everyone Formats:\n${PREFIX}resetvctime all | Resets all voicechat minutes ever\n${PREFIX}resetvctime month | Resets the user voicechat minutes only for this month`,
    admin: true,
    page: 3,
  })
  @Guard(NotBotMessage, IsAdminWithResponse)
  async resetCurse(message: CommandMessage): Promise<void> {
    this.responseEmbed = CREATE_DEFAULT_EMBED("Success", "Reset all user voicechat minutes");
    if (message.args.length !== 1) {
      if (message.args.time !== 'all' && message.args.time !== 'month')
        this.responseEmbed = CREATE_ERROR_EMBED('Error!', `Invalid parameters! Use ${PREFIX}help for help`)
    }

    const allUsers = await onlineTimeService.findAll();

    for (const user of allUsers) {
      user.vcCountPerDay = [{lastJoined: DateTime.local().toISO(), minutes: 0, isInVc: false}];
      if (message.args.time === 'all') {
        user.vcMinutesAllTime = 0;
      }
      onlineTimeService.update({userid: user.userid}, user);
    }

    const sentMessage = await message.channel.send(this.responseEmbed)
    await message.delete({timeout: TIMEOUT});
    await sentMessage.delete();
  }
}
