import {ChartService} from "./ChartService";
import {CommandMessage} from "@typeit/discord";
import {onlineTimeService} from "../OnlineTimeService";
import {DateTime} from "luxon";
import {UserPOJO} from "../../pojo/UserPOJO";
import {ChartConfiguration, ChartDataSets} from "chart.js";
import {DEFAULT_COLOR_HEX, possibleChartColors} from "../../utils/constants";

export class OnlineTimeChart extends ChartService {
    config: ChartConfiguration = {
        type: 'line',
        data: {
            labels: [],
            datasets: []
        },
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
                xAxes: [{
                    type: 'time',
                    scaleLabel: {
                        display: true,
                        fontSize: 20,
                        labelString: 'Date',
                        fontColor: DEFAULT_COLOR_HEX
                    },
                    gridLines: {
                        lineWidth: 2,
                        color: "#6b6b6b"
                    },
                    ticks: {
                        beginAtZero: true,
                        autoSkip: false,
                        fontSize: 24,
                        fontColor: "white"
                    },
                    time: {
                        unit: 'day',
                        displayFormats: {
                            day: 'll'
                        }
                    },
                }],
                yAxes: [
                    {
                        scaleLabel: {
                            display: true,
                            labelString: 'Minutes',
                            fontSize: 20,
                            fontColor: DEFAULT_COLOR_HEX
                        },
                        ticks: {
                            autoSkip: false,
                            beginAtZero: true,
                            fontSize: 24,
                            fontColor: "white",
                        },
                        gridLines: {
                            lineWidth: 2,
                            color: "#6b6b6b"
                        },
                    }
                ]
            }
        }
    }

    async sendOnlineMinutesChart(message: CommandMessage) {
        const users = await onlineTimeService.getTopOnlineMembersThisMonth();
        const top10users = users.slice(0, 10);

        this.prepareLabels(top10users);
        this.prepareData(top10users);
        const image = await this.canvasRenderService.renderToBuffer(this.config);
        await this.sendChart(message, image)
    }

    private prepareLabels(users: UserPOJO[]) {
        const labels = [];
        for (const user of users) {
            for (const day of user.minutesOnlinePerDay) {
                const formattedDay = DateTime.fromISO(day.lastJoined).toISODate();
                const labelindex = labels.findIndex(label => label === formattedDay);
                if (labelindex == -1) labels.push(formattedDay);
            }
        }
        this.config.data.labels = labels;
    }

    private prepareData(users: UserPOJO[]) {
        const datasets: ChartDataSets[] = [];
        for (let i = 0; i < users.length; i++) {
            const data = [];
            for (const day of users[i].vcCountPerDay) {
                data.push({
                    t: DateTime.fromISO(day.lastJoined).toISODate(),
                    y: day.minutes
                });
            }

            datasets.push({
                label: `Online minutes for ${users[i].username}`,
                data: data,
                borderColor: possibleChartColors[i],
                borderWidth: 6,
                fill: false,
                pointBorderColor: "white",
                pointRadius: 8,
                pointStyle: 'rectRounded',
                pointBackgroundColor: 'white'
            })
        }

        this.config.data.datasets = datasets
    }
}
