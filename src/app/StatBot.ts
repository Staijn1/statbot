import {CommandMessage, CommandNotFound, Discord,} from "@typeit/discord";
import * as Path from "path";
import {prefix} from "./constants";

@Discord(prefix, {
    import: [
        Path.join(__dirname, "commands", "*.js"),
        Path.join(__dirname, "events", "*.js")
    ]
})
export abstract class StatBot {
        @CommandNotFound()
    notFound(message: CommandMessage): void {
        message.channel.send("Command not found, please get some help");
    }
}
