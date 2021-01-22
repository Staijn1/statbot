import {Command, CommandMessage, Infos} from "@typeit/discord";
import {DATE_FORMAT, DEFAULT_COLOR_RGB, LOGGER, possibleChartColors, PREFIX} from "../utils/constants";
import {MessageAttachment} from "discord.js";
import {ChartService} from "../services/ChartService";
import {curseService} from "../services/CurseService";
import {CREATE_ERROR_EMBED, getUserId} from "../utils/Functions";
import {DateTime} from "luxon";
import {CursePOJO} from "../pojo/CursePOJO";
import {ChartDataSets} from "chart.js";


export abstract class CurseChart {
    chartService = new ChartService();

    @Command("curseChart :user")
    @Infos({
        description: `Get a curse chart. Formats:\n${PREFIX}curseChart | Gets all amount of curses per day in the last month\n${PREFIX}resetCurse @User | Gets the curse count per day of the tagged user\n`,
        page: 2,
        admin: false,
    })
    async showCurseChart(message: CommandMessage): Promise<void> {
        let image: Buffer;
        if (message.args.user) {
            image = await this.handleUserChart(message);
        } else {
            image = await this.handleTop10Chart(message);
        }

        if (image) {
            const attachment = new MessageAttachment(image, 'chart.png');
            try {
                await message.channel.send('', attachment);
            } catch (e) {
                LOGGER.error(`${e.message} || ${e.stack}`)
                await message.channel.send(CREATE_ERROR_EMBED("Error!", "Sorry, I couldn't send your chart"))
            }
        } else await message.channel.send(CREATE_ERROR_EMBED("Error!", "Sorry, I couldn't send your chart"))
    }

    private async handleUserChart(message: CommandMessage): Promise<Buffer> {
        const userTargeted = await curseService.findOne({userid: getUserId(message.args.user)});

        if (!userTargeted || !userTargeted.cursePerDay) {
            await message.channel.send(CREATE_ERROR_EMBED("Error!", "No data is available for this user."));
            return;
        }

        const labels: string[] = [];
        const data: number[] = [];

        userTargeted.cursePerDay.forEach(cursePerDay => {
            labels.push(cursePerDay.date);
            data.push(cursePerDay.count);
        });

        this.chartService.setTitle(`Curses a day for ${userTargeted.username}`)
        this.chartService.setData({
            labels: labels,
            datasets: [
                {
                    label: '# of curses per day',
                    data: data,
                    borderColor: DEFAULT_COLOR_RGB,
                    borderWidth: 6,
                    fill: false,
                    pointBorderColor: "white",
                    pointRadius: 8,
                    pointStyle: 'rectRounded',
                    pointBackgroundColor: 'white'
                }],
        });
        return this.chartService.getBuffer();
    }

    private async handleTop10Chart(message: CommandMessage): Promise<Buffer> {
        const top10Users = await curseService.getTopCursers();
        const labels = this.prepareLabels(top10Users);
        const datasets = this.prepareDatasets(top10Users, labels);
        this.chartService.setTitle("Curses a day for the top 10 profane users")
        this.chartService.setData({
            labels: labels,
            datasets: datasets
        });

        return this.chartService.getBuffer();
    }

    private prepareDatasets(top10Users: CursePOJO[], labels: string[]) {
        const datasets: ChartDataSets[] = [];
        for (const [index, user] of top10Users.entries()) {
            const userDataPerDay = [];
            for (const label of labels) {
                try {
                    const day = user.cursePerDay.find(cursePerDay => cursePerDay.date === label);
                    if (!day) {
                        userDataPerDay.push(null);
                    } else {
                        userDataPerDay.push(day.count);
                    }
                } catch (e) {
                    LOGGER.error(`${e.message} || ${e.stack}`);
                    userDataPerDay.push(null);
                }
            }
            const color = possibleChartColors[index];
            datasets.push({
                label: `Curse count per day for ${user.username}`,
                data: userDataPerDay,
                borderColor: color,
                borderWidth: 6,
                fill: false,
                pointBorderColor: "white",
                pointRadius: 8,
                pointStyle: 'rectRounded',
                pointBackgroundColor: color
            })
        }
        return datasets;
    }

    private prepareLabels(top10Users: CursePOJO[]): string[] {
        const today = DateTime.local();
        let earliestDate = today;


        for (const user of top10Users) {
            if (!user.cursePerDay) break;

            for (const cursePerDay of user.cursePerDay) {
                const date = DateTime.fromFormat(cursePerDay.date, DATE_FORMAT);
                const difference = earliestDate.diff(date, 'days').days;
                if (difference > 0) {
                    earliestDate = date;
                }
            }
        }


        const amountOfDays = today.diff(earliestDate, 'days').days;
        const daysInBetween: string[] = [];
        for (let i = 0; i <= amountOfDays; i++) {
            const newDate = earliestDate.plus({days: i});
            daysInBetween.push(newDate.toFormat(DATE_FORMAT));
        }

        return daysInBetween;
    }
}
