"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChartService = void 0;
const chartjs_node_canvas_1 = require("chartjs-node-canvas");
const constants_1 = require("../utils/constants");
const luxon_1 = require("luxon");
const functions_1 = require("../utils/functions");
const discord_js_1 = require("discord.js");
class ChartService {
    constructor() {
        this.width = 1200;
        this.height = 800;
        this.configuration = {
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
        this.canvasRenderService = new chartjs_node_canvas_1.CanvasRenderService(this.width, this.height);
        this.configuration.options.title.text = this.titleText;
    }
    async getBuffer() {
        if (!this.configuration.data)
            throw Error("No data in chart!");
        this.configuration.options.title.text = this.titleText;
        return await this.canvasRenderService.renderToBuffer(this.configuration);
    }
    setData(data) {
        this.configuration.data = data;
    }
    setTitle(title) {
        this.titleText = title;
    }
    prepareData(labels, user) {
        const userDataPerDay = [];
        for (const label of labels) {
            try {
                const dayMatchingLabel = user.countPerDays.find(day => day.date === label);
                if (!dayMatchingLabel) {
                    userDataPerDay.push(0);
                }
                else {
                    userDataPerDay.push(dayMatchingLabel.count);
                }
            }
            catch (e) {
                constants_1.LOGGER.error(`${e.message} || ${e.stack}`);
                userDataPerDay.push(0);
            }
        }
        return userDataPerDay;
    }
    prepareLabels(top10Users) {
        const today = luxon_1.DateTime.local();
        let earliestDate = today;
        for (const user of top10Users) {
            if (!user.countPerDays)
                break;
            for (const day of user.countPerDays) {
                const date = luxon_1.DateTime.fromFormat(day.date, constants_1.DATE_FORMAT);
                const difference = earliestDate.diff(date, 'days').days;
                if (difference > 0) {
                    earliestDate = date;
                }
            }
        }
        const amountOfDays = today.diff(earliestDate, 'days').days;
        const daysInBetween = [];
        for (let i = 0; i <= amountOfDays; i++) {
            const newDate = earliestDate.plus({ days: i });
            daysInBetween.push(newDate.toFormat(constants_1.DATE_FORMAT));
        }
        return daysInBetween;
    }
    async handleUserChart(userTargeted, title, label) {
        if (!userTargeted || !userTargeted.countPerDays) {
            return;
        }
        const labels = [];
        const data = [];
        userTargeted.countPerDays.forEach(day => {
            labels.push(day.date);
            data.push(day.count);
        });
        this.setTitle(title);
        this.setData({
            labels: labels,
            datasets: [
                {
                    label: label,
                    data: data,
                    borderColor: constants_1.DEFAULT_COLOR_HEX,
                    borderWidth: 6,
                    fill: false,
                    pointBorderColor: "white",
                    pointRadius: 8,
                    pointStyle: 'rectRounded',
                    pointBackgroundColor: 'white'
                }
            ],
        });
        return this.getBuffer();
    }
    async handleTop10Chart(top10Users, title, partialLabelString) {
        const labels = this.prepareLabels(top10Users);
        const datasets = this.prepareDatasets(top10Users, labels, partialLabelString);
        this.setTitle(title);
        this.setData({
            labels: labels,
            datasets: datasets
        });
        return this.getBuffer();
    }
    prepareDatasets(top10Users, labels, partialLabelString) {
        const datasets = [];
        for (const [index, user] of top10Users.entries()) {
            const userDataPerDay = this.prepareData(labels, user);
            const color = constants_1.possibleChartColors[index];
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
            });
        }
        return datasets;
    }
    async sendChart(message, image) {
        const response = functions_1.CREATE_DEFAULT_EMBED("\n", "");
        let sentMessage;
        if (image) {
            const attachment = new discord_js_1.MessageAttachment(image, 'chart.png');
            response.setImage('attachment://chart.png');
            try {
                await message.channel.send({ files: [attachment], embed: response });
            }
            catch (e) {
                constants_1.LOGGER.error(`${e.message} || ${e.stack}`);
                const errorResponse = functions_1.CREATE_ERROR_EMBED("Error!", "Sorry, I couldn't send your chart");
                errorResponse.setFooter(`Reason: ${e.message}\n If you think this is an error, please contact the server owner first or send Staijn#5100 a message`);
                sentMessage = await message.channel.send(errorResponse);
            }
        }
        else
            sentMessage = await message.channel.send(functions_1.CREATE_ERROR_EMBED("Error!", "Sorry, I couldn't send your chart, because of missing data"));
        return sentMessage;
    }
}
exports.ChartService = ChartService;
//# sourceMappingURL=ChartService.js.map