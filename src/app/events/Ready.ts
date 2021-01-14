import {On} from "@typeit/discord";
import {Main} from "../Main";
import {saveService} from "../services/SaveService";
import {UserPOJO} from "../pojo/UserPOJO";
import {DateTime} from "luxon";


export abstract class Ready {
    @On("ready")
    initialize(): void {
        console.log("Bot logged in. Registering everyone");

        Main.Client.guilds.fetch(process.env.GUILD_TOKEN).then(guild => {
            return guild.members.fetch();
        }).then(users => {
            for (const item of users) {
                if (saveService.isOnline(item[1].user.presence) && !item[1].user.bot && !saveService.findUserActivity(item[1].user.id)){
                    saveService.addUserActivities(new UserPOJO(item[1].user.username, item[1].user.id, 0, DateTime.local().toISO()))
                }
            }
        });
        console.log("Done!");
        console.log("===============================================================");
    }
}
