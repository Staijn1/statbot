import {Command, CommandMessage, Description} from "@typeit/discord";
import {CREATE_ERROR_EMBED, DATE_FORMAT, DEFAULT_COLOR_RGB, LOGGER, PREFIX} from "../utils/constants";
import {MessageAttachment} from "discord.js";
import {ChartService} from "../services/ChartService";
import {curseService} from "../services/CurseService";
import {getUserId} from "../utils/Functions";
import {DateTime} from "luxon";
import {CursePOJO} from "../pojo/CursePOJO";
import {ChartDataSets} from "chart.js";


export abstract class CurseChart {
    chartService = new ChartService();

    @Command("curseChart :user")
    @Description(`Get a curse chart
     Formats:\n
     ${PREFIX}curseChart | Gets all amount of curses per day in the last month\n
     ${PREFIX}resetCurse @User | Gets the curse count per day of the tagged user\n`)
    async showCurseChart(message: CommandMessage): Promise<void> {
        let image: Buffer;
        if (message.args.user) {
            image = await this.handleUserChart(message);
        } else {
            image = await this.handleTop10Chart(message);
        }

        if (image) {
            const attachment = new MessageAttachment(image, 'chart.png');
            await message.channel.send('', attachment);
        }
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

    getRandomColor() {
        const letters = '0123456789ABCDEF'.split('');
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
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
        const possibleColors = [
            '#FAD141',
            '#D94B21',
            '#C330F0',
            '#216FD9',
            '#26FC75',
            '#c6f839',
            '#D975D5',
            '#88C6FC',
            '#EAF59A',
            '#C73C6C'
        ];

        const datasets: ChartDataSets[] = [];
        for (const [index,user] of top10Users.entries()) {
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
            const color = possibleColors[index];
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
            try {
                for (const cursePerDay of user.cursePerDay) {
                    const date = DateTime.fromFormat(cursePerDay.date, DATE_FORMAT);
                    const difference = earliestDate.diff(date, 'days').days;
                    if (difference > 0) {
                        earliestDate = date;
                    }
                }
            } catch (e) {
                LOGGER.error(`${e.message} || ${e.stack}`);
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
