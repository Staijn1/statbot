import {On} from "@typeit/discord";
import {ACTIVE_USER, CRON_SCHEDULE, DATE_FORMAT, LOGGER} from "../utils/constants";
import {Main} from "../Main";
import {onlineTimeService} from "../services/OnlineTimeService";
import {UserPOJO} from "../pojo/UserPOJO";
import {DateTime} from "luxon";
import {curseService} from "../services/CurseService";
import {constrain, CREATE_DEFAULT_EMBED} from "../utils/Functions";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const schedule = require("node-schedule")

export abstract class EReady {
    @On("ready")
    initialize(): void {
        const guildMembers = Main.Client.guilds.cache.get(process.env.GUILD_TOKEN).members.cache;
        guildMembers.forEach((guildMember) => {
            onlineTimeService.findOne({userid: guildMember.user.id}).then(user => {
                const isOnline = onlineTimeService.isOnline(guildMember.user.presence);
                // If the user is online, not a bot and does not exist in our database yet, add him.
                if (isOnline && !guildMember.user.bot && !user) {
                    onlineTimeService.addUserActivities(new UserPOJO(guildMember.user.username, guildMember.user.id, 0, DateTime.local().toISO(), true, 0, 0))
                }
                // If the user exists, put his online status to his current online status, so it matches. Because we can't guarantee he was online all the time since onlineSince, we don't calculate minutes online.// Minutes are lost
                else if (user) {
                    user.isOnline = isOnline;
                    onlineTimeService.update({userid: user.userid}, user);
                }
            });

            //Make old code (curseCount) compatible by transferring cursecount to today
            curseService.findOne({userid: guildMember.user.id}).then(curseUser => {
                if (curseUser && !curseUser.cursePerDay) {
                    curseUser.cursePerDay = [{
                        date: DateTime.local().toFormat(DATE_FORMAT),
                        count: curseUser.curseCountAllTime
                    }];
                    curseUser.curseCountAllTime = 0;
                    curseService.update({userid: curseUser.userid}, curseUser);
                }
            })
        });


        // This function will fire at that time
        schedule.scheduleJob(CRON_SCHEDULE, async () => {
            LOGGER.info("Resetting message count and updating inactive count. It's the first of the month!")
            const users = await onlineTimeService.findAll();
            users.forEach(user => {
                if (user.messagesSent < ACTIVE_USER) {
                    try {
                        user.inactiveWarnings++;
                        const guildName = Main.Client.guilds.cache.get(process.env.GUILD_TOKEN).name;
                        guildMembers.get(user.userid).send(CREATE_DEFAULT_EMBED("Inactivity warning", `You have received an inactivity warning because you sent too few messages. You might get kicked if you are too inactive. To remove the warning, be more active this month.\n\nThis inactivity warning is for the server: ${guildName}`))
                    } catch (e) {
                        LOGGER.error(`${e.message} || ${e.stack}`)
                    }
                } else {
                    user.inactiveWarnings = user.inactiveWarnings--;
                }
                // Max 240 warnings. That is 240 months. Should be more than enough. You can build a two month (-2) buffer by being active
                user.inactiveWarnings = constrain(user.inactiveWarnings, -2, 240);
                user.messagesSent = 0;
                onlineTimeService.update({userid: user.userid}, user);
            });

            const curseUsers = await curseService.findAll();
            for (const user of curseUsers) {
                if (!user.cursePerDay) break;
                for (const cursePerDay of user.cursePerDay) {
                    user.curseCountAllTime += cursePerDay.count;
                }
                user.cursePerDay = [];
                curseService.update({userid: user.userid}, user);
            }
            LOGGER.info("Resetting message count and updating inactive count. It's the first of the month!")
        })
        LOGGER.info('Bot started');
    }
}
