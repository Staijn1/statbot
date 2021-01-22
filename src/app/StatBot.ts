import {CommandMessage, CommandNotFound, Discord,} from "@typeit/discord";
import * as Path from "path";
import {PREFIX} from "./utils/constants";

@Discord(PREFIX, {
    import: [
        Path.join(__dirname, "commands", "**", "*.js"),
        Path.join(__dirname, "events", "**", "*.js")
    ]
})
export abstract class StatBot {
    @CommandNotFound()
    async notFound(message: CommandMessage): Promise<void> {
        await message.channel.send(`Command not found, if you need help, use ${PREFIX}help`);
    }
}
