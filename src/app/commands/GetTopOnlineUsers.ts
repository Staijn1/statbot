import {Command, CommandMessage, Description} from "@typeit/discord";
import {MessageEmbed} from "discord.js";
import {CREATE_DEFAULT_EMBED, DEFAULT_COLOR} from "../constants";
import {saveService} from "../services/SaveService";
import {Duration} from "luxon";
import {UserPOJO} from "../pojo/UserPOJO";

export abstract class GetTopOnlineUsers {

    @Command("topOnline")
    @Description("get the top online users. losers.")
    showTop10OnlineUsers(message: CommandMessage): void {
        const embed = CREATE_DEFAULT_EMBED("Top 10 Online Users", "")

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

        const author = saveService.findUserActivity(message.author.id);
        if (!author) {
            embed.setFooter("Sorry your curse count could not be loaded.");
        } else {
            const formattedTime = Duration.fromObject({minutes: Math.floor(author.totalMinutesOnline)}).toFormat(("y 'years' d 'days' h 'hours' m 'minutes"));
            embed.setFooter(`You have been online for ${formattedTime}`);
        }

        message.channel.send(embed);
    }
}
