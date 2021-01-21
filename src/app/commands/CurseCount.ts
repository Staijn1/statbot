import {Command, CommandMessage, Description} from "@typeit/discord";
import {LOGGER} from "../utils/constants";
import {curseService} from "../services/CurseService";
import {CursePOJO} from "../pojo/CursePOJO";
import {CREATE_DEFAULT_EMBED} from "../utils/Functions";

export abstract class CurseCount {
    @Command("curse")
    @Description("These are the most profane users")
    async showCurseCount(message: CommandMessage): Promise<void> {
        const response = CREATE_DEFAULT_EMBED("Top 10 Profane Users", "");

        const topCursers: CursePOJO[] = await curseService.getTopCursers();

        if (topCursers.length > 0) {
            try {
                const member = await message.guild.members.cache.get(topCursers[0].userid);
                response.setThumbnail(member.user.displayAvatarURL());
            } catch (e) {
                LOGGER.error(`${e.message} || ${e.stack}`)
            }
        }

        for (let i = 0; i < topCursers.length; i++) {
            const user = topCursers[i];
            response.addField(`${i + 1}. ${user.username}`, `Cursed: ${user.curseCountAllTime} times.`);
        }

        const author = await curseService.findOne({userid: message.author.id});
        if (!author) {
            response.setFooter("Sorry your curse count could not be loaded.");
        } else {
            let cursesThisMonth = 0;
            author.cursePerDay.forEach(cursePerDay => cursesThisMonth += cursePerDay.count)
            const index = topCursers.findIndex(user => user.userid === message.author.id);
            response.setFooter(`You have cursed ${author.curseCountAllTime + cursesThisMonth} times.\nPosition: ${index + 1}`);
        }
        await message.channel.send(response);
    }
}
