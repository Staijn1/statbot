import {Command, CommandMessage, Infos} from "@typeit/discord";
import {DATE_FORMAT, PREFIX} from "../../utils/constants";
import {ChartService} from "../../services/ChartService";
import {getUserId} from "../../utils/functions";
import {onlineTimeService} from "../../services/OnlineTimeService";
import {DateTime} from "luxon";
import {UserPOJO} from "../../pojo/UserPOJO";


export abstract class VoicechatMinutes {
    chartService = new ChartService();

    @Command("vcminutes :user")
    @Infos({
        description: `Get a line chart with the minutes the user(s) spent in voicechat this month. Formats:\n${PREFIX}vcminutes | Shows the minutes per day of the top 10 most chatty users\n${PREFIX}vcminutes @User | Gets the minutes per day in voicechat of that user\n`,
        page: 2,
        admin: false,
    })
    async showMinutesChart(message: CommandMessage): Promise<void> {
        let image: Buffer;
        if (message.args.user) {
            let targetedUser = await onlineTimeService.findOne({userid: getUserId(message.args.user)});
            const title = targetedUser ? `Voicechat minutes per day for ${targetedUser.username}` : '';
            targetedUser = this.convertUser(targetedUser);
            image = await this.chartService.handleUserChart(targetedUser, title, "# of minutes in voicechat per day");
        } else {
            const allUsers = await onlineTimeService.getMostInVoicechatThisMonth();
            const convertedUsers = []
            for (const user of allUsers.slice(0, 10)) {
                convertedUsers.push(this.convertUser(user))
            }
            image = await this.chartService.handleTop10Chart(convertedUsers, "Top 10 Users In Voicechat This Month", "Voicechat minute count for");
        }

        await this.chartService.sendChart(message, image);
    }

    private convertUser(targetedUser: UserPOJO): UserPOJO {
        targetedUser.countPerDays = []
        if (targetedUser.vcCountPerDay) {
            targetedUser.vcCountPerDay.forEach((vcDay, index) => {
                const converted = {count: vcDay.minutes, date: DateTime.fromISO(vcDay.lastJoined).toFormat(DATE_FORMAT)}
                targetedUser.countPerDays[index] = converted
            })
        }
        return targetedUser
    }
}
