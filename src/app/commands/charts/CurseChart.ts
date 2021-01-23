import {Command, CommandMessage, Infos} from "@typeit/discord";
import {PREFIX} from "../../utils/constants";
import {ChartService} from "../../services/ChartService";
import {curseService} from "../../services/CurseService";
import {getUserId} from "../../utils/functions";


export abstract class CurseChart {
    chartService = new ChartService();

    @Command("cursechart :user")
    @Infos({
        description: `Get a curse chart. Formats:\n${PREFIX}cursechart | Gets all amount of curses per day in the last month\n${PREFIX}cursechart @User | Gets the curse count per day of the tagged user\n`,
        page: 2,
        admin: false,
    })
    async showCurseChart(message: CommandMessage): Promise<void> {
        let image: Buffer;
        if (message.args.user) {
            const targetedUser = await curseService.findOne({userid: getUserId(message.args.user)})
            image = await this.chartService.handleUserChart(targetedUser, `Curse count for user ${targetedUser.username}`, "# of curses per day");
        } else {
            const allusers = await curseService.getTopCursersOfThisMonth();
            image = await this.chartService.handleTop10Chart(allusers.slice(0, 10), "Top 10 Profane Users This Month", 'Curse count for');
        }

        await this.chartService.sendChart(message, image);
    }

}
