import {CanvasRenderService} from "chartjs-node-canvas";
import {ChartConfiguration} from "chart.js";
import {LOGGER} from "../../utils/constants";
import {CommandMessage} from "@typeit/discord";
import {CREATE_DEFAULT_EMBED, CREATE_ERROR_EMBED} from "../../utils/functions";
import {Message, MessageAttachment} from "discord.js";

export abstract class ChartService {
    protected width = 1200;
    protected height = 800;
    protected canvasRenderService: CanvasRenderService;


    constructor() {
        this.canvasRenderService = new CanvasRenderService(this.width, this.height);
    }


    protected async render(config: ChartConfiguration): Promise<Buffer> {
        return await this.canvasRenderService.renderToBuffer(config)
    }

    async sendChart(message: CommandMessage, image: Buffer): Promise<Message> {
        const response = CREATE_DEFAULT_EMBED("\n", "");
        let sentMessage;
        if (image) {
            const attachment = new MessageAttachment(image, 'chart.png');
            response.setImage('attachment://chart.png');
            try {
                await message.channel.send({files: [attachment], embed: response});
            } catch (e) {
                LOGGER.error(`${e.message} || ${e.stack}`)
                const errorResponse = CREATE_ERROR_EMBED("Error!", "Sorry, I couldn't send your chart")
                errorResponse.setFooter(`Reason: ${e.message}\n If you think this is an error, please contact the server owner first or send Staijn#5100 a message`)
                sentMessage = await message.channel.send(errorResponse)
            }
        } else sentMessage = await message.channel.send(CREATE_ERROR_EMBED("Error!", "Sorry, I couldn't send your chart, because of missing data"))
        return sentMessage;
    }
}
