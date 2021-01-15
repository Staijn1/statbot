import {Command, CommandMessage, Description} from "@typeit/discord";
import {MessageEmbed} from "discord.js";
import {DEFAULT_COLOR, LOGGER} from "../constants";
import {saveService} from "../services/SaveService";
import {DateTime, Duration} from "luxon";
import {UserPOJO} from "../pojo/UserPOJO";

export abstract class GetTopOnlineUsers {

    @Command("topOnline")
    @Description("get the top online users. losers.")
    showTop10OnlineUsers(message: CommandMessage): void {
        const embed = new MessageEmbed()
            // Set the title of the field
            .setTitle('Top 10 Most Online Users')
            // Set the color of the embed
            .setColor(DEFAULT_COLOR)

        const maxLoopLength = saveService.users.length < 10 ? saveService.users.length : 10;
        saveService.updateOnlineTime();
        saveService.sort((a: UserPOJO, b: UserPOJO) => {
            if (a.totalMinutesOnline < b.totalMinutesOnline) return 1;
            if (a.totalMinutesOnline > b.totalMinutesOnline) return -1;
            return 0;
        })


        for (let i = 0; i < maxLoopLength; i++) {
            const user = saveService.users[i];
            const formattedTime = Duration.fromObject({minutes: Math.floor(user.totalMinutesOnline)}).toFormat(("y 'years' d 'days' h 'hours' m 'minutes"));
            embed.addField(`${i + 1}. ${user.username}`, formattedTime);
        }

        message.channel.send(embed);
    }
}
