import {ChartService} from "./ChartService";
import {CommandMessage} from "@typeit/discord";
import {onlineTimeService} from "../OnlineTimeService";
import {UserPOJO} from "../../pojo/UserPOJO";
import {ChartConfiguration, ChartDataSets} from "chart.js";
import {DATE_FORMAT, DEFAULT_COLOR_HEX} from "../../utils/constants";
import {DateTime} from "luxon";
import {curseService} from "../CurseService";
import {CursePOJO} from "../../pojo/CursePOJO";
import {CREATE_ERROR_EMBED} from "../../utils/functions";

export class ActivityChartService extends ChartService {
    config: ChartConfiguration = {
        type: 'line',
        data: {
            labels: [],
            datasets: []
        },
        options: {
            legend: {
                position: 'bottom',
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
                        id: 'minutes',
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
                    },
                    {
                        id: 'amount',
                        scaleLabel: {
                            display: true,
                            labelString: 'Amount',
                            fontSize: 20,
                            fontColor: DEFAULT_COLOR_HEX
                        },
                        position: 'right',
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

    async sendActivityChart(message: CommandMessage, targetedUserID: string): Promise<void> {
        const targetedUserPOJO = await onlineTimeService.findOne({userid: targetedUserID});
        const targetedCursePOJO = await curseService.findOne({userid: targetedUserID});

        if (!targetedUserPOJO || !targetedCursePOJO) {
            await message.channel.send(CREATE_ERROR_EMBED("Error!", "Missing data to create your chart!"))
            return;
        }

        // Update the online time of the user
        if (targetedUserPOJO.minutesOnlinePerDay.length > 0) {
            const [lastKnownDay] = targetedUserPOJO.minutesOnlinePerDay.slice(-1);
            const isCurrentlyOnline = lastKnownDay.isOnline
            onlineTimeService.updateOnlineTimeOnlineUser(targetedUserPOJO, isCurrentlyOnline);
        }

        this.setLabels(targetedUserPOJO, targetedCursePOJO);

        const onlineTimeDataset = this.getOnlineTimeDataset(targetedUserPOJO);
        const vcTimeDataset = this.getVCTimeDataset(targetedUserPOJO);
        const messagesAmountDataset = this.getMessagesDataset(targetedUserPOJO);
        const curseAmountDataset = this.getCurseAmountDataset(targetedCursePOJO);

        this.config.data.datasets = [onlineTimeDataset, messagesAmountDataset, vcTimeDataset, curseAmountDataset]
        this.config.options.title.text = `Online activities for ${targetedUserPOJO.username}`;

        const image = await this.canvasRenderService.renderToBuffer(this.config);
        await this.sendChart(message, image)
    }

    private getOnlineTimeDataset(targetedUserPOJO: UserPOJO): ChartDataSets {
        const data = [];
        for (const day of targetedUserPOJO.minutesOnlinePerDay) {
            const date = DateTime.fromISO(day.lastJoined);
            const formatted = date.toFormat(DATE_FORMAT);
            data.push({t: DateTime.fromFormat(formatted, DATE_FORMAT).toISO(), y: day.minutes});
        }
        return {
            label: 'Online minutes per day',
            yAxisID: 'minutes',
            data: data,
            borderColor: DEFAULT_COLOR_HEX,
            borderWidth: 6,
            fill: false,
            pointBorderColor: "white",
            pointRadius: 8,
            pointStyle: 'rectRounded',
            pointBackgroundColor: 'white'
        }
    }

    private setLabels(targetedUserPOJO: UserPOJO, targetedCursePOJO: CursePOJO) {
        const labels = [];
        for (const day of targetedUserPOJO.minutesOnlinePerDay) {
            const formattedDay = DateTime.fromISO(day.lastJoined).toISODate();
            const labelindex = labels.findIndex(label => label === formattedDay);
            if (labelindex == -1) labels.push(formattedDay);
        }

        for (const day of targetedUserPOJO.vcCountPerDay) {
            const formattedDay = DateTime.fromISO(day.lastJoined).toISODate();
            const labelindex = labels.findIndex(label => label === formattedDay);
            if (labelindex == -1) labels.push(formattedDay);
        }

        for (const day of targetedUserPOJO.countPerDays) {
            const formattedDay = DateTime.fromFormat(day.date, DATE_FORMAT).toISODate();
            const labelindex = labels.findIndex(label => label === formattedDay);
            if (labelindex == -1) labels.push(formattedDay);
        }

        for (const day of targetedCursePOJO.countPerDays) {
            const formattedDay = DateTime.fromFormat(day.date, DATE_FORMAT).toISODate();
            const labelindex = labels.findIndex(label => label === formattedDay);
            if (labelindex == -1) labels.push(formattedDay);
        }

        labels.sort(((a, b) => {
            return DateTime.fromISO(a).diff(DateTime.fromISO(b), 'days').days;
        }))
        this.config.data.labels = labels;
    }

    private getVCTimeDataset(targetedUserPOJO: UserPOJO): ChartDataSets {
        const data = [];
        for (const day of targetedUserPOJO.vcCountPerDay) {
            data.push({t: DateTime.fromISO(day.lastJoined).toISODate(), y: day.minutes});
        }
        return {
            label: 'Voicechat minutes per day',
            yAxisID: 'minutes',
            data: data,
            borderColor: '#FFF00F',
            borderWidth: 6,
            fill: false,
            pointBorderColor: "white",
            pointRadius: 8,
            pointStyle: 'rectRounded',
            pointBackgroundColor: 'white'
        }
    }

    private getMessagesDataset(targetedUserPOJO: UserPOJO): ChartDataSets {
        const data = [];
        for (const day of targetedUserPOJO.countPerDays) {
            data.push({t: DateTime.fromFormat(day.date, DATE_FORMAT).toISO(), y: day.count});
        }
        return {
            label: 'Amount of messages per day',
            yAxisID: 'amount',
            data: data,
            borderColor: '#00FF00',
            borderWidth: 6,
            fill: false,
            pointBorderColor: "white",
            pointRadius: 8,
            pointStyle: 'rectRounded',
            pointBackgroundColor: 'white'
        }
    }

    private getCurseAmountDataset(targetedCursePOJO: CursePOJO) {
        const data = [];
        for (const day of targetedCursePOJO.countPerDays) {
            data.push({t: DateTime.fromFormat(day.date, DATE_FORMAT).toISO(), y: day.count});
        }
        return {
            label: 'Amount of curses per day',
            yAxisID: 'amount',
            data: data,
            borderColor: '#00FFFF',
            borderWidth: 6,
            fill: false,
            pointBorderColor: "white",
            pointRadius: 8,
            pointStyle: 'rectRounded',
            pointBackgroundColor: 'white'
        }
    }
}
