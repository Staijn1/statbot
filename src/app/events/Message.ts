import {ArgsOf, Guard, On} from "@typeit/discord";
import {curseService} from "../services/CurseService";
import {NotBotMessage} from "../guards/NotBot";


export abstract class EMessage {
    @On("message")
    @Guard(NotBotMessage)
    message([message]: ArgsOf<"message">): void {
        curseService.checkMessage(message.content, message.author.id)
    }
}
