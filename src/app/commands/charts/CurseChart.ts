import {Command, CommandMessage, Infos} from "@typeit/discord";
import {curseService} from "../../services/CurseService";
import {CountChartService} from "../../services/chart/CountChartService";


export abstract class CurseChart {
    chartService = new CountChartService();

    @Command("cursechart")
    @Infos({
        description: `Get the curse chart of the top 10 cursers this month`,
        page: 2,
        admin: false,
    })
    async showCurseChart(message: CommandMessage): Promise<void> {
        const allusers = await curseService.getTopCursersOfThisMonth();
        const image = await this.chartService.handleTop10Chart(allusers.slice(0, 10), "Top 10 Profane Users This Month", 'Curse count for');

        await this.chartService.sendChart(message, image);
    }

}
