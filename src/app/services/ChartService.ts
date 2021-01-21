import {CanvasRenderService} from "chartjs-node-canvas";
import {ChartConfiguration, ChartData} from "chart.js";

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
                        userCallback: function(label, index, labels) {
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
}
