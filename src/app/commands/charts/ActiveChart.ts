import {Command, CommandMessage, Infos} from "@typeit/discord";
import {PREFIX} from "../../utils/constants";
import {ChartService} from "../../services/ChartService";
import {getUserId} from "../../utils/functions";
import {onlineTimeService} from "../../services/OnlineTimeService";


export abstract class ActiveChart {
    chartService = new ChartService();

    @Command("activechart :user")
    @Infos({
        description: `Get an active chart. This chart contains messages sent per day. Formats:\n${PREFIX}activechart | Gets all amount of messages per day in the last month\n${PREFIX}activechart @User | Gets the message count per day of the tagged user\n`,
        page: 2,
        admin: false,
    })
    async showActiveChart(message: CommandMessage): Promise<void> {
        let image: Buffer;
        if (message.args.user) {
            const targetedUser = await onlineTimeService.findOne({userid: getUserId(message.args.user)});
            const title = targetedUser ? `Message count per day for ${targetedUser.username}` : '';
            image = await this.chartService.handleUserChart(targetedUser, title, "# of messages per day");
        } else {
            const allUsers = await onlineTimeService.getMostActiveThisMonth();
            image = await this.chartService.handleTop10Chart(allUsers.slice(0, 10), "Top 10 Active Users This Month", "Message count for");
        }

        await this.chartService.sendChart(message, image);
    }
}
