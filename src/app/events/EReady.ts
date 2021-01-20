import {On} from "@typeit/discord";
import {ACTIVE_USER, constrain, CREATE_DEFAULT_EMBED, LOGGER} from "../constants";
import {Main} from "../Main";
import {onlineTimeService} from "../services/OnlineTimeService";
import {UserPOJO} from "../pojo/UserPOJO";
import {DateTime} from "luxon";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const schedule = require("node-schedule")

export abstract class EReady {
    @On("ready")
    async initialize(): Promise<void> {
        const guildMembers = await Main.Client.guilds.cache.get(process.env.GUILD_TOKEN).members.cache;
        guildMembers.forEach((guildMember) => {
            onlineTimeService.findOne({userid: guildMember.user.id}).then(user => {
                const isOnline = onlineTimeService.isOnline(guildMember.user.presence);
                // If the user is online, not a bot and does not exist in our database yet, add him.
                if (isOnline && !guildMember.user.bot && !user) {
                    onlineTimeService.addUserActivities(new UserPOJO(guildMember.user.username, guildMember.user.id, 0, DateTime.local().toISO(), true, 0, 0))
                }
                // If the user exists, put his online status to his current online status, so it matches. Because we can't guarantee he was online all the time since onlineSince, we don't calculate minutes online.
                // Minutes are lost
                else if (user) {
                    user.isOnline = isOnline;
                    onlineTimeService.update({userid: user.userid}, user);
                }
            });
        });

        // 0 0 1 * *
        // at 00:00 first day of the month
        // This function will fire at that time
        schedule.scheduleJob('0 0 1 * *', async () => {
            LOGGER.info("Resetting message count and updating inactive count. It's the first of the month!")
            const users = await onlineTimeService.find({});
            users.forEach(user => {
                if (user.messagesSent < ACTIVE_USER) {
                    user.inactiveWarnings++;
                    const guildName = Main.Client.guilds.cache.get(process.env.GUILD_TOKEN).name;
                    guildMembers.get(user.userid).send(CREATE_DEFAULT_EMBED("Inactivity warning", `You have received an inactivity warning because you sent too few messages. You might get kicked if you are too inactive. To remove the warning, be more active this month.\n\nThis inactivity warning is for the server: ${guildName}`))
                } else {
                    user.inactiveWarnings = user.inactiveWarnings--;
                }
                // Max 240 warnings. That is 240 months. Should be more than enough. You can build a two month (-2) buffer by being active
                user.inactiveWarnings = constrain(user.inactiveWarnings, -2, 240);
                user.messagesSent = 0;
                onlineTimeService.update({userid: user.userid}, user);
            });
        })
        LOGGER.info('Bot started');
    }
}
