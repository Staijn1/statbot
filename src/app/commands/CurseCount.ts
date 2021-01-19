import {Command, CommandMessage, ComputedRules, Description, Rule, Rules} from "@typeit/discord";
import {CREATE_DEFAULT_EMBED} from "../constants";
import {saveService} from "../services/SaveService";
import {UserPOJO} from "../pojo/UserPOJO";

export abstract class CurseCount {
    @Command("curse")
    @Description("These are the most profane users")
    async showCurseCount(message: CommandMessage): Promise<void> {
        const response = CREATE_DEFAULT_EMBED("Top 10 Profane Users", "")

        saveService.sort((a: UserPOJO, b: UserPOJO) => {
            if (a.curseCount < b.curseCount) return 1;
            if (a.curseCount > b.curseCount) return -1;
            return 0;
        });

        const sortedUsers = saveService.users;
        const maxLoopLength = sortedUsers.length < 10 ? sortedUsers.length : 10;
        const member = await message.guild.members.cache.get(sortedUsers[0].userid);
        response.setThumbnail(member.user.displayAvatarURL());

        for (let i = 0; i < maxLoopLength; i++) {
            const user = sortedUsers[i];
            response.addField(`${i + 1}. ${user.username}`, `Cursed: ${user.curseCount} times.`);
        }

        const author = saveService.findUserActivity(message.author.id);
        if (!author) {
            response.setFooter("Sorry your curse count could not be loaded.");
        } else {
            const index = sortedUsers.findIndex(user => user.userid === message.author.id);
            response.setFooter(`You have cursed ${author.curseCount} times.\nPosition: ${index + 1}`);
        }
        await message.channel.send(response);
    }
}
