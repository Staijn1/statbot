import {On} from "@typeit/discord";
import {ACTIVE_USER, CRON_SCHEDULE, DATE_FORMAT, LOGGER, PREFIX} from "../utils/constants";
import {Main} from "../Main";
import {UserPOJO} from "../pojo/UserPOJO";
import {DateTime} from "luxon";
import {constrain, CREATE_DEFAULT_EMBED} from "../utils/functions";
import {curseService} from "../services/CurseService";
import {onlineTimeService} from "../services/OnlineTimeService";
import {EPresenceUpdate} from "./EPresenceUpdate";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const schedule = require("node-schedule")

export abstract class EReady {


    @On("ready")
    async initialize(): Promise<void> {
        await Main.Client.user.setActivity(`${PREFIX}help`, {type: "LISTENING"})

        const guildMembers = Main.Client.guilds.cache.get(process.env.GUILD_TOKEN).members.cache.array();

        for (const guildMember of guildMembers) {
            //todo check if user is in vc
            const user = await onlineTimeService.findOne({userid: guildMember.user.id})
            const isCurrentlyOnline = onlineTimeService.isOnline(guildMember.presence);

            // If the user is online, not a bot and does not exist in our database yet, add him.
            if (isCurrentlyOnline && !guildMember.user.bot) {
                if (!user) {
                    const newUser = new UserPOJO(
                        guildMember.user.username,
                        guildMember.user.id,
                        [
                            {
                                lastJoined: DateTime.local().toISO(),
                                isOnline: true,
                                minutes: 0
                            }
                        ],
                        0,
                        0,
                        0,
                        [{
                            date: DateTime.local().toFormat(DATE_FORMAT),
                            count: 0
                        }], 0,
                        [{
                            lastJoined: DateTime.local().toISO(),
                            minutes: 0,
                            isInVc: false
                        }])

                    onlineTimeService.insert(newUser);
                } else {
                    //We treat this user as if he just went online.
                    const presenceUpdate = new class extends EPresenceUpdate {
                    }
                    await presenceUpdate.online(guildMember.presence);
                }
            } else if (!isCurrentlyOnline && user) {
                if (!user.minutesOnlinePerDay) return;
                for (const day of user.minutesOnlinePerDay) {
                    day.isOnline = false;
                }
                const userid = user ? user.userid : undefined;
                onlineTimeService.update({userid: userid}, user);
            }
        }

        // This function will fire at that time
        schedule.scheduleJob(CRON_SCHEDULE, async () => {
            await this.executeCronJob(guildMembers);
        });

        LOGGER.info('Bot started');
    }

    private async checkInactivity(user: UserPOJO, messagesSentThisMonth): Promise<UserPOJO> {
        if (messagesSentThisMonth < ACTIVE_USER) {
            user.inactiveWarnings++;
            try {
                const guild = Main.Client.guilds.cache.get(process.env.GUILD_TOKEN);
                const guildName = guild.name;
                await Main.Client.users.cache.get(user.userid).send(CREATE_DEFAULT_EMBED("Inactivity warning", `You have received an inactivity warning because you sent too few messages. You might get kicked if you are too inactive. To remove the warning, be more active this month.\n\nThis inactivity warning is for the server: ${guildName}`));
                LOGGER.info(`${user.username} received an inactivity warning`)
            } catch (e) {
                LOGGER.error(`User: ${user.username} ID: ${user.userid}`)
                LOGGER.error(`${e.message} || ${e.stack}`);
            }
        } else user.inactiveWarnings = user.inactiveWarnings--;

        // Max 240 warnings. That is 240 months. Should be more than enough. You can build a two month (-2) buffer by being active
        user.inactiveWarnings = constrain(user.inactiveWarnings, -2, 240);
        return user;
    }

    private async executeCronJob(guildMembers) {
        LOGGER.info("Resetting message count and updating inactive count. It's the first of the month!")
        const users = await onlineTimeService.findAll();
        for (let user of users) {
            let messagesSentThisMonth = 0;
            if (user.countPerDays) {
                user.countPerDays.forEach(day => messagesSentThisMonth += day.count);
                user.messagesSentAllTime += messagesSentThisMonth;
                user.countPerDays = [{
                    date: DateTime.local().toFormat(DATE_FORMAT),
                    count: 0
                }];
            }
            user = await this.checkInactivity(user, messagesSentThisMonth);

            let minutesInVcThisMonth = 0;
            if (user.vcCountPerDay) {
                let isInVc = false;
                user.vcCountPerDay.forEach(day => {
                    minutesInVcThisMonth += day.minutes;
                    isInVc = day.isInVc
                });
                user.vcCountPerDay = [{
                    lastJoined: DateTime.local().toISO(),
                    minutes: 0,
                    isInVc: isInVc
                }];
                user.vcMinutesAllTime += minutesInVcThisMonth;
            }

            let minutesOnlineThisMonth = 0;
            if (user.minutesOnlinePerDay) {
                let isOnline = false;
                user.minutesOnlinePerDay.forEach(day => {
                    minutesOnlineThisMonth += day.minutes;
                    isOnline = day.isOnline;
                });
                user.minutesOnlinePerDay = [{
                    lastJoined: DateTime.local().toISO(),
                    minutes: 0,
                    isOnline: isOnline,
                }];
                user.totalMinutesOnlineAllTime += minutesOnlineThisMonth;
            }
            onlineTimeService.update({userid: user.userid}, user);
        }

        const curseUsers = await curseService.findAll();
        for (const user of curseUsers) {
            if (!user.countPerDays) break;
            for (const day of user.countPerDays) {
                user.curseCountAllTime += day.count;
            }
            user.countPerDays = [{
                date: DateTime.local().toFormat(DATE_FORMAT),
                count: 0
            }];
            curseService.update({userid: user.userid}, user);
        }
    }
}
