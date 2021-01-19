import {Command, CommandMessage, Description} from "@typeit/discord";
import {CREATE_DEFAULT_EMBED} from "../constants";
import {saveService} from "../services/SaveService";
import {Duration} from "luxon";
import {UserPOJO} from "../pojo/UserPOJO";

export abstract class GetTopOnlineUsers {

    @Command("topOnline")
    @Description("get the top online users. losers.")
    async showTop10OnlineUsers(message: CommandMessage): Promise<void> {
        const embed = CREATE_DEFAULT_EMBED("Top 10 Online Users", "Times are sum of all online time")

        const maxLoopLength = saveService.users.length < 10 ? saveService.users.length : 10;
        saveService.updateOnlineTime();
        saveService.sort((a: UserPOJO, b: UserPOJO) => {
            if (a.totalMinutesOnline < b.totalMinutesOnline) return 1;
            if (a.totalMinutesOnline > b.totalMinutesOnline) return -1;
            return 0;
        });

        const sortedUsers = saveService.users;
        const user = await message.guild.members.cache.get(sortedUsers[0].userid)
        embed.setThumbnail(user.user.displayAvatarURL())

        for (let i = 0; i < maxLoopLength; i++) {
            const user = saveService.users[i];
            const formattedTime = Duration.fromObject({minutes: Math.floor(user.totalMinutesOnline)}).toFormat(("y 'years' d 'days' h 'hours' m 'minutes"));
            embed.addField(`${i + 1}. ${user.username}`, formattedTime);
        }

        const author = saveService.findUserActivity(message.author.id);
        if (!author) {
            embed.setFooter("Sorry your online time could not be loaded.");
        } else {
            const formattedTime = Duration.fromObject({minutes: Math.floor(author.totalMinutesOnline)}).toFormat(("y 'years' d 'days' h 'hours' m 'minutes"));
            const position = sortedUsers.findIndex(user => user.userid === message.author.id);
            embed.setFooter(`You have been online for ${formattedTime}.\nPosition: ${position + 1}`);
        }

        await message.channel.send(embed);
    }
}
