import {Command, CommandMessage, Infos} from "@typeit/discord";
import {PREFIX} from "../../utils/constants";
import {CREATE_ERROR_EMBED, getUserId} from "../../utils/functions";
import {ActivityChartService} from "../../services/chart/ActivityChartService";


export abstract class ActivityChart {
    chartService = new ActivityChartService();

    @Command("activitychart :user")
    @Infos({
        description: `Get the activity for the specified user`,
        page: 2,
        admin: false,
    })
    async showActivityChart(message: CommandMessage): Promise<void> {
        if (message.args.user) {
            await this.chartService.sendActivityChart(message, getUserId(message.args.user));
        } else {
            await message.channel.send(CREATE_ERROR_EMBED("Error!", `You need to tag a user to get his chart. For more help, check ${PREFIX}help if you need help`))
        }
    }
}
