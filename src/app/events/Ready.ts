import {On} from "@typeit/discord";
import {Main} from "../Main";
import {saveService} from "../services/SaveService";
import {UserPOJO} from "../pojo/UserPOJO";
import {DateTime} from "luxon";
import {LOGGER} from "../constants";


export abstract class EReady {
    @On("ready")
    initialize(): void {
        Main.Client.guilds.fetch(process.env.GUILD_TOKEN).then(guild => {
            return guild.members.fetch();
        }).then(users => {
            for (const item of users) {
                if (saveService.isOnline(item[1].user.presence) && !item[1].user.bot && !saveService.findUserActivity(item[1].user.id)) {
                    saveService.addUserActivities(new UserPOJO(item[1].user.username, item[1].user.id, 0, DateTime.local().toISO(), true, 0))
                }
            }
        });
        LOGGER.info('Bot started')
    }
}
