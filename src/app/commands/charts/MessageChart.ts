import {Command, CommandMessage, Infos} from "@typeit/discord";
import {onlineTimeService} from "../../services/OnlineTimeService";
import {CountChartService} from "../../services/chart/CountChartService";


export abstract class CurseChart {
    chartService = new CountChartService();

    @Command("messageChart")
    @Infos({
        description: `Get the messages chart of the top 10 messagers this month`,
        page: 2,
        admin: false,
    })
    async showMessageChart(message: CommandMessage): Promise<void> {
        const allusers = await onlineTimeService.getMostMessagersThisMonth();
        const image = await this.chartService.handleTop10Chart(allusers.slice(0, 10), "Top 10 Messaging Users This Month", 'Message count for');

        await this.chartService.sendChart(message, image);
    }

}
