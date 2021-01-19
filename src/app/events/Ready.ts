import {ArgsOf, Client, On} from "@typeit/discord";
import {Main} from "../Main";
import {saveService} from "../services/SaveService";
import {UserPOJO} from "../pojo/UserPOJO";
import {DateTime} from "luxon";
import {ACTIVE_USER, constrain, CREATE_DEFAULT_EMBED, LOGGER} from "../constants";

const schedule = require("node-schedule")

export abstract class EReady {
    @On("ready")
    initialize([]: ArgsOf<"ready">,client: Client): void {
        const users = Main.Client.guilds.cache.get(process.env.GUILD_TOKEN).members.cache;
        for (const item of users) {
            if (saveService.isOnline(item[1].user.presence) && !item[1].user.bot && !saveService.findUserActivity(item[1].user.id)) {
                saveService.addUserActivities(new UserPOJO(item[1].user.username, item[1].user.id, 0, DateTime.local().toISO(), true, 0, 0, 0))
            }
        }
        LOGGER.info('Bot started');


        // 0 0 1 * *
        // at 00:00 first day of the month
        schedule.scheduleJob('0 0 1 * *', async () => {
            LOGGER.info("Resetting message count and updating inactive count. It's the first of the month!")
            for (const user of saveService.users) {
                if (user.messagesSent < ACTIVE_USER) {
                    user.inactiveWarnings++;
                    await users.get(user.userid).send(CREATE_DEFAULT_EMBED("Inactivity warning", "You have received an inactivity warning because you sent too few messages. You might get kicked if you are too inactive. To remove the warning, be more active this month."))
                } else {
                    user.inactiveWarnings--;
                }
                user.inactiveWarnings = constrain(user.inactiveWarnings, -2, 12);
                user.messagesSent = 0;
            }
            saveService.updateAllUserActivity();
        })
    }
}
