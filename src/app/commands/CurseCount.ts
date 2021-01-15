import {Command, CommandMessage, Description} from "@typeit/discord";
import {MessageEmbed} from "discord.js";
import {DEFAULT_COLOR} from "../constants";
import {saveService} from "../services/SaveService";
import {UserPOJO} from "../pojo/UserPOJO";

export abstract class CurseCount {

    @Command("curse")
    @Description("These are the most profane users")
    showTop10OnlineUsers(message: CommandMessage): void {
        const embed = new MessageEmbed()
            // Set the title of the field
            .setTitle('Top 10 Profane Users')
            // Set the color of the embed
            .setColor(DEFAULT_COLOR)

        saveService.sort((a: UserPOJO, b: UserPOJO) => {
            if (a.curseCount < b.curseCount) return 1;
            if (a.curseCount > b.curseCount) return -1;
            return 0;
        });

        const maxLoopLength = saveService.users.length < 10 ? saveService.users.length : 10;

        for (let i = 0; i < maxLoopLength; i++) {
            const user = saveService.users[i];
            embed.addField(`${i + 1}. ${user.username}`, `Cursed: ${user.curseCount} times`);
        }

        message.channel.send(embed);
    }
}
