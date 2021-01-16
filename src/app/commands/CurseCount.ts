import {Command, CommandMessage, Description} from "@typeit/discord";
import {CREATE_DEFAULT_EMBED} from "../constants";
import {saveService} from "../services/SaveService";
import {UserPOJO} from "../pojo/UserPOJO";

export abstract class CurseCount {

    @Command("curse")
    @Description("These are the most profane users")
    showTop10OnlineUsers(message: CommandMessage): void {
        const response = CREATE_DEFAULT_EMBED("Top 10 Profane Users", "")

        saveService.sort((a: UserPOJO, b: UserPOJO) => {
            if (a.curseCount < b.curseCount) return 1;
            if (a.curseCount > b.curseCount) return -1;
            return 0;
        });

        const maxLoopLength = saveService.users.length < 10 ? saveService.users.length : 10;

        for (let i = 0; i < maxLoopLength; i++) {
            const user = saveService.users[i];
            response.addField(`${i + 1}. ${user.username}`, `Cursed: ${user.curseCount} times`);
        }

        const author = saveService.findUserActivity(message.author.id);
        if (!author) {
            response.setFooter("Sorry your curse count could not be loaded.");
        } else {
            response.setFooter(`You have cursed ${author.curseCount} times.`);
        }
        message.channel.send(response);
    }
}
