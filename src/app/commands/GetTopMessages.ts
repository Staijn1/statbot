import {Command, CommandMessage, Description} from "@typeit/discord";
import {CREATE_DEFAULT_EMBED} from "../constants";
import {saveService} from "../services/SaveService";
import {Duration} from "luxon";
import {UserPOJO} from "../pojo/UserPOJO";

export abstract class GetTopActiveUsers {

    @Command("topactive")
    @Description("Get the top active users based on messages.")
    async showTop10OnlineUsers(message: CommandMessage): Promise<void> {
        const embed = CREATE_DEFAULT_EMBED("Top 10 Active Users", "The count of messages in this month.")

        const maxLoopLength = saveService.users.length < 10 ? saveService.users.length : 10;
        saveService.sort((a: UserPOJO, b: UserPOJO) => {
            if (a.messagesSent < b.messagesSent) return 1;
            if (a.messagesSent > b.messagesSent) return -1;
            return 0;
        });

        const sortedUsers = saveService.users;
        const user = await message.guild.members.cache.get(sortedUsers[0].userid)
        embed.setThumbnail(user.user.displayAvatarURL())

        for (let i = 0; i < maxLoopLength; i++) {
            const user = saveService.users[i];
            embed.addField(`${i + 1}. ${user.username}`, `${user.messagesSent} messages sent`);
        }

        const author = saveService.findUserActivity(message.author.id);
        if (!author) {
            embed.setFooter("Sorry your message count could not be loaded.");
        } else {
            const position = sortedUsers.findIndex(user => user.userid === message.author.id);
            embed.setFooter(`You have sent ${author.messagesSent} this month.\nPosition: ${position + 1}`);
        }

        await message.channel.send(embed);
    }
}
