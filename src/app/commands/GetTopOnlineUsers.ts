import {Command, CommandMessage, Description} from "@typeit/discord";
import {MessageEmbed} from "discord.js";
import {color} from "../constants";
import {saveService} from "../services/SaveService";

export abstract class GetTopOnlineUsers {

    @Command("top10online")
    @Description("get the top online users. losers.")
    showTop10OnlineUsers(message: CommandMessage): void {
        const embed = new MessageEmbed()
            // Set the title of the field
            .setTitle('Top 10 Most Online Users')
            // Set the color of the embed
            .setColor(color)
            // Set the main content of the embed
            .setDescription('heres your top 10 losers')

        saveService.users.sort((userA, userB) => (userA.totalMinutesOnline < userB.totalMinutesOnline) ? 1 : -1)
        const maxLoopLength = saveService.users.length < 10 ? saveService.users.length : 10;

        //todo updating needs work
        /*
        for (let i = 0; i < maxLoopLength; i++) {
            const user = saveService.users[i];
            embed.addField(`${i + 1}. ${user.username}`, `${Math.round(user.totalMinutesOnline)} minutes`);
            const difference = DateTime.local().diff(user.onlineSince, 'minutes');
            const onlineTimeInMinutes = difference.minutes;
            user.totalMinutesOnline += user.totalMinutesOnline + onlineTimeInMinutes;
        }*/

        message.channel.send(embed);
    }
}
