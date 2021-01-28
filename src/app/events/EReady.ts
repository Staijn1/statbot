import {On} from "@typeit/discord";
import {ACTIVE_USER, CRON_SCHEDULE, DATE_FORMAT, LOGGER, PREFIX} from "../utils/constants";
import {Main} from "../Main";
import {UserPOJO} from "../pojo/UserPOJO";
import {DateTime} from "luxon";
import {constrain, CREATE_DEFAULT_EMBED} from "../utils/functions";
import {curseService} from "../services/CurseService";
import {onlineTimeService} from "../services/OnlineTimeService";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const schedule = require("node-schedule")

export abstract class EReady {
    @On("ready")
    async initialize(): Promise<void> {
        const guildMembers = Main.Client.guilds.cache.get(process.env.GUILD_TOKEN).members.cache;
        guildMembers.forEach((guildMember) => {
            onlineTimeService.findOne({userid: guildMember.user.id}).then(user => {
                const isOnline = onlineTimeService.isOnline(guildMember.user.presence);
                // If the user is online, not a bot and does not exist in our database yet, add him.
                if (isOnline && !guildMember.user.bot && !user) {
                    onlineTimeService.addUserActivities(
                        new UserPOJO(
                            guildMember.user.username,
                            guildMember.user.id,
                            [],
                            0,
                            0,
                            0,
                            [{
                                date: DateTime.local().toFormat(DATE_FORMAT),
                                count: 0
                            }], 0,
                            [{
                                lastJoined: DateTime.local().toFormat(DATE_FORMAT),
                                minutes: 0,
                                isInVc: false
                            }]));
                }
                    // If the user exists, put his online status to his current online status, so it matches. Because we can't guarantee he was online all the time since onlineSince, we don't calculate minutes online.
                // Minutes are lost
                else if (user) {
                    //todo
                    throw Error('Not implemented')
                    /*
                    user.isOnline = isOnline;
                    // Convert old message format to new
                    if (!user.countPerDays) {
                        user.countPerDays = [
                            {
                                date: DateTime.local().toFormat(DATE_FORMAT),
                                count: user.messagesSentAllTime
                            }
                        ];
                        user.messagesSentAllTime = 0;
                    }
                    if (user.vcCountPerDay) {
                        const vcDay = user.vcCountPerDay.find(day => day.isInVc === true);
                        if (vcDay) vcDay.lastJoined = DateTime.local().toISO();
                    } else user.vcCountPerDay = []

                    onlineTimeService.update({userid: user.userid}, user);

                     */
                }
            });

            //Make old code (curseCount) compatible by transferring cursecount to today
            curseService.findOne({userid: guildMember.user.id}).then(curseUser => {
                if (curseUser && !curseUser.countPerDays) {
                    curseUser.countPerDays = [{
                        date: DateTime.local().toFormat(DATE_FORMAT),
                        count: curseUser.curseCountAllTime
                    }];
                    curseUser.curseCountAllTime = 0;
                    curseService.update({userid: curseUser.userid}, curseUser);
                }
            })
        });

        await Main.Client.user.setActivity(`${PREFIX}help`, {type: "LISTENING"})

        // This function will fire at that time
        schedule.scheduleJob(CRON_SCHEDULE, async () => {
            await this.executeCronJob(guildMembers);
        });

        LOGGER.info('Bot started');
    }

    private checkInactivity(user: UserPOJO, messagesSentThisMonth, guildMembers): UserPOJO {
        if (messagesSentThisMonth < ACTIVE_USER) {
            user.inactiveWarnings++;
            try {
                const guildName = Main.Client.guilds.cache.get(process.env.GUILD_TOKEN).name;
                guildMembers.get(user.userid).send(CREATE_DEFAULT_EMBED("Inactivity warning", `You have received an inactivity warning because you sent too few messages. You might get kicked if you are too inactive. To remove the warning, be more active this month.\n\nThis inactivity warning is for the server: ${guildName}`))
            } catch (e) {
                LOGGER.error(`${e.message} || ${e.stack}`)
            }
        } else user.inactiveWarnings = user.inactiveWarnings--;

        return user;
    }

    private async executeCronJob(guildMembers) {
        LOGGER.info("Resetting message count and updating inactive count. It's the first of the month!")
        const users = await onlineTimeService.findAll();
        users.forEach(user => {
            let messagesSentThisMonth = 0;
            if (user.countPerDays) {
                user.countPerDays.forEach(day => messagesSentThisMonth += day.count);
                user.messagesSentAllTime += messagesSentThisMonth;
                user.countPerDays = [];
            }
            user = this.checkInactivity(user, messagesSentThisMonth, guildMembers);

            // Max 240 warnings. That is 240 months. Should be more than enough. You can build a two month (-2) buffer by being active
            user.inactiveWarnings = constrain(user.inactiveWarnings, -2, 240);


            let minutesInVcThisMonth = 0;
            if (user.vcCountPerDay) {
                user.vcCountPerDay.forEach(day => minutesInVcThisMonth += day.minutes);
                user.vcCountPerDay = [];
                user.vcMinutesAllTime += minutesInVcThisMonth;
            }

            onlineTimeService.update({userid: user.userid}, user);
        });

        const curseUsers = await curseService.findAll();
        for (const user of curseUsers) {
            if (!user.countPerDays) break;
            for (const day of user.countPerDays) {
                user.curseCountAllTime += day.count;
            }
            user.countPerDays = [];
            curseService.update({userid: user.userid}, user);
        }
    }
}
