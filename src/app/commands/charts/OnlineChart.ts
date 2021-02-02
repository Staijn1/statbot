import {Command, CommandMessage, Infos} from "@typeit/discord";
import {OnlineTimeChart} from "../../services/chart/OnlineTimeChart";


export abstract class OnlineChart {
    chartService = new OnlineTimeChart();

    @Command("onlinechart")
    @Infos({
        description: `Get a line chart with the minutes the user(s) spent in online`,
        page: 2,
        admin: false,
    })
    async showMinutesChart(message: CommandMessage): Promise<void> {
        await this.chartService.sendOnlineMinutesChart(message);
    }
}
