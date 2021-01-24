import {CanvasRenderService} from "chartjs-node-canvas";
import {ChartConfiguration, ChartData, ChartDataSets} from "chart.js";
import {UserPOJO} from "../pojo/UserPOJO";
import {CursePOJO} from "../pojo/CursePOJO";
import {DATE_FORMAT, DEFAULT_COLOR_RGB, LOGGER, possibleChartColors} from "../utils/constants";
import {DateTime} from "luxon";
import {CommandMessage} from "@typeit/discord";
import {CREATE_DEFAULT_EMBED, CREATE_ERROR_EMBED} from "../utils/functions";
import {Message, MessageAttachment} from "discord.js";

export class ChartService {
    private titleText: string | string[];
    private width = 1200;
    private height = 800;
    private canvasRenderService: CanvasRenderService;
    private configuration: ChartConfiguration = {
        type: 'line',
        data: {},
        options: {
            legend: {
                position: 'right',
                labels: {
                    fontColor: "white",
                    fontSize: 18
                }
            },
            title: {
                display: true,
                fontColor: "white",
                fontSize: 28,
            },
            scales: {
                yAxes: [{
                    gridLines: {
                        lineWidth: 2,
                        color: "#6b6b6b"
                    },
                    ticks: {
                        beginAtZero: true,
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        //@ts-ignore
                        userCallback: function (label) {
                            if (Math.floor(label) === label) {
                                return label;
                            }
                        },
                        fontSize: 24,
                        fontColor: "white",
                    }
                }],
                xAxes: [{
                    gridLines: {
                        lineWidth: 2,
                        color: "#6b6b6b"
                    },
                    ticks: {
                        fontSize: 24,
                        fontColor: "white"
                    }
                }],
            }
        }
    };


    constructor() {
        this.canvasRenderService = new CanvasRenderService(this.width, this.height);
        this.configuration.options.title.text = this.titleText;
    }


    async getBuffer(): Promise<Buffer> {
        if (!this.configuration.data) throw Error("No data in chart!");

        this.configuration.options.title.text = this.titleText;
        return await this.canvasRenderService.renderToBuffer(this.configuration)
    }

    setData(data: ChartData): void {
        this.configuration.data = data;
    }

    setTitle(title: string | string[]): void {
        this.titleText = title;
    }

    prepareData(labels: string[], user: UserPOJO | CursePOJO): number[] {
        const userDataPerDay = [];
        for (const label of labels) {
            try {
                const dayMatchingLabel = user.countPerDays.find(day => day.date === label);
                if (!dayMatchingLabel) {
                    userDataPerDay.push(0);
                } else {
                    userDataPerDay.push(dayMatchingLabel.count);
                }
            } catch (e) {
                LOGGER.error(`${e.message} || ${e.stack}`);
                userDataPerDay.push(0);
            }
        }
        return userDataPerDay;
    }

    prepareLabels(top10Users: CursePOJO[] | UserPOJO[]): string[] {
        const today = DateTime.local();
        let earliestDate = today;

        for (const user of top10Users) {
            if (!user.countPerDays) break;
            for (const day of user.countPerDays) {
                const date = DateTime.fromFormat(day.date, DATE_FORMAT);
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

    async handleUserChart(userTargeted: UserPOJO | CursePOJO, title: string, label: string): Promise<Buffer> {
        if (!userTargeted || !userTargeted.countPerDays) {
            return;
        }

        const labels: string[] = [];
        const data: number[] = [];

        userTargeted.countPerDays.forEach(day => {
            labels.push(day.date);
            data.push(day.count);
        });

        this.setTitle(title)
        this.setData({
            labels: labels,
            datasets: [
                {
                    label: label,
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
        return this.getBuffer();
    }

    async handleTop10Chart(top10Users: CursePOJO[] | UserPOJO[], title: string, partialLabelString: string): Promise<Buffer> {
        const labels = this.prepareLabels(top10Users);
        const datasets = this.prepareDatasets(top10Users, labels, partialLabelString);
        this.setTitle(title)
        this.setData({
            labels: labels,
            datasets: datasets
        });

        return this.getBuffer();
    }

    prepareDatasets(top10Users: CursePOJO[] | UserPOJO[], labels: string[], partialLabelString: string): ChartDataSets[] {
        const datasets: ChartDataSets[] = [];
        for (const [index, user] of top10Users.entries()) {
            const userDataPerDay = this.prepareData(labels, user);
            const color = possibleChartColors[index];
            datasets.push({
                label: `${partialLabelString} ${user.username}`,
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

    async sendChart(message: CommandMessage, image: Buffer): Promise<Message> {
        const response = CREATE_DEFAULT_EMBED("\n", "");
        let sentMessage;
        if (image) {
            const attachment = new MessageAttachment(image, 'chart.png');
            response.setImage('attachment://chart.png');
            try {
                await message.channel.send({ files: [attachment], embed: response });
            } catch (e) {
                LOGGER.error(`${e.message} || ${e.stack}`)
                sentMessage = await message.channel.send(CREATE_ERROR_EMBED("Error!", "Sorry, I couldn't send your chart"))
            }
        } else sentMessage = await message.channel.send(CREATE_ERROR_EMBED("Error!", "Sorry, I couldn't send your chart, because of missing data"))
        return sentMessage;
    }
}
