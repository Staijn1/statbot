import {Command, CommandMessage, Infos} from "@typeit/discord";
import {VCChartService} from "../../services/chart/VCChartService";


export abstract class VCChart {
  chartService = new VCChartService();

  @Command("vcchart")
  @Infos({
    description: `Get a line chart with the minutes the user(s) spent in voicechat this month.\nTimes are not accurate when people are still in voicechat!`,
    page: 2,
    admin: false,
  })
  async showMinutesChart(message: CommandMessage): Promise<void> {
    await this.chartService.sendVCChart(message);
  }
}
