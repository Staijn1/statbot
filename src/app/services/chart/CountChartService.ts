import {ChartService} from "./ChartService";
import {UserPOJO} from "../../pojo/UserPOJO";
import {CursePOJO} from "../../pojo/CursePOJO";
import {DateTime} from "luxon";
import {DATE_FORMAT, LOGGER, possibleChartColors} from "../../utils/constants";
import {ChartConfiguration, ChartDataSets} from "chart.js";

export class CountChartService extends ChartService {
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

    async handleTop10Chart(top10Users: CursePOJO[] | UserPOJO[], title: string, partialLabelString: string): Promise<Buffer> {
        const labels = this.prepareLabels(top10Users);
        const datasets = this.prepareDatasets(top10Users, labels, partialLabelString);
        this.configuration.options.title.text = title;
        this.configuration.data.labels = labels;
        this.configuration.data.datasets = datasets;

        return this.render(this.configuration);
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
}
