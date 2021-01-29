"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EReady = void 0;
const tslib_1 = require("tslib");
const discord_1 = require("@typeit/discord");
const constants_1 = require("../utils/constants");
const Main_1 = require("../Main");
const UserPOJO_1 = require("../pojo/UserPOJO");
const luxon_1 = require("luxon");
const functions_1 = require("../utils/functions");
const CurseService_1 = require("../services/CurseService");
const OnlineTimeService_1 = require("../services/OnlineTimeService");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const schedule = require("node-schedule");
class EReady {
    async initialize() {
        const guildMembers = Main_1.Main.Client.guilds.cache.get(process.env.GUILD_TOKEN).members.cache;
        guildMembers.forEach((guildMember) => {
            OnlineTimeService_1.onlineTimeService.findOne({ userid: guildMember.user.id }).then(user => {
                const isOnline = OnlineTimeService_1.onlineTimeService.isOnline(guildMember.user.presence);
                // If the user is online, not a bot and does not exist in our database yet, add him.
                if (isOnline && !guildMember.user.bot && !user) {
                    OnlineTimeService_1.onlineTimeService.addUserActivities(new UserPOJO_1.UserPOJO(guildMember.user.username, guildMember.user.id, 0, luxon_1.DateTime.local().toISO(), true, 0, 0, [{
                            date: luxon_1.DateTime.local().toFormat(constants_1.DATE_FORMAT),
                            count: 0
                        }], 0, []));
                }
                // If the user exists, put his online status to his current online status, so it matches. Because we can't guarantee he was online all the time since onlineSince, we don't calculate minutes online.
                // Minutes are lost
                else if (user) {
                    user.isOnline = isOnline;
                    // Convert old message format to new
                    if (!user.countPerDays) {
                        user.countPerDays = [
                            {
                                date: luxon_1.DateTime.local().toFormat(constants_1.DATE_FORMAT),
                                count: user.messagesSentAllTime
                            }
                        ];
                        user.messagesSentAllTime = 0;
                    }
                    if (user.vcCountPerDay) {
                        const vcDay = user.vcCountPerDay.find(day => day.isInVc === true);
                        if (vcDay)
                            vcDay.lastJoined = luxon_1.DateTime.local().toISO();
                    }
                    else
                        user.vcCountPerDay = [];
                    OnlineTimeService_1.onlineTimeService.update({ userid: user.userid }, user);
                }
            });
            //Make old code (curseCount) compatible by transferring cursecount to today
            CurseService_1.curseService.findOne({ userid: guildMember.user.id }).then(curseUser => {
                if (curseUser && !curseUser.countPerDays) {
                    curseUser.countPerDays = [{
                            date: luxon_1.DateTime.local().toFormat(constants_1.DATE_FORMAT),
                            count: curseUser.curseCountAllTime
                        }];
                    curseUser.curseCountAllTime = 0;
                    CurseService_1.curseService.update({ userid: curseUser.userid }, curseUser);
                }
            });
        });
        await Main_1.Main.Client.user.setActivity(`${constants_1.PREFIX}help`, { type: "LISTENING" });
        // This function will fire at that time
        schedule.scheduleJob(constants_1.CRON_SCHEDULE, async () => {
            await this.executeCronJob(guildMembers);
        });
        constants_1.LOGGER.info('Bot started');
    }
    checkInactivity(user, messagesSentThisMonth, guildMembers) {
        if (messagesSentThisMonth < constants_1.ACTIVE_USER) {
            user.inactiveWarnings++;
            try {
                const guildName = Main_1.Main.Client.guilds.cache.get(process.env.GUILD_TOKEN).name;
                guildMembers.get(user.userid).send(functions_1.CREATE_DEFAULT_EMBED("Inactivity warning", `You have received an inactivity warning because you sent too few messages. You might get kicked if you are too inactive. To remove the warning, be more active this month.\n\nThis inactivity warning is for the server: ${guildName}`));
            }
            catch (e) {
                constants_1.LOGGER.error(`${e.message} || ${e.stack}`);
            }
        }
        else
            user.inactiveWarnings = user.inactiveWarnings--;
        return user;
    }
    async executeCronJob(guildMembers) {
        constants_1.LOGGER.info("Resetting message count and updating inactive count. It's the first of the month!");
        const users = await OnlineTimeService_1.onlineTimeService.findAll();
        users.forEach(user => {
            let messagesSentThisMonth = 0;
            if (user.countPerDays) {
                user.countPerDays.forEach(day => messagesSentThisMonth += day.count);
                user.messagesSentAllTime += messagesSentThisMonth;
                user.countPerDays = [];
            }
            user = this.checkInactivity(user, messagesSentThisMonth, guildMembers);
            // Max 240 warnings. That is 240 months. Should be more than enough. You can build a two month (-2) buffer by being active
            user.inactiveWarnings = functions_1.constrain(user.inactiveWarnings, -2, 240);
            let minutesInVcThisMonth = 0;
            if (user.vcCountPerDay) {
                user.vcCountPerDay.forEach(day => minutesInVcThisMonth += day.minutes);
                user.vcCountPerDay = [];
                user.vcMinutesAllTime += minutesInVcThisMonth;
            }
            OnlineTimeService_1.onlineTimeService.update({ userid: user.userid }, user);
        });
        const curseUsers = await CurseService_1.curseService.findAll();
        for (const user of curseUsers) {
            if (!user.countPerDays)
                break;
            for (const day of user.countPerDays) {
                user.curseCountAllTime += day.count;
            }
            user.countPerDays = [];
            CurseService_1.curseService.update({ userid: user.userid }, user);
        }
    }
}
tslib_1.__decorate([
    discord_1.On("ready"),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], EReady.prototype, "initialize", null);
exports.EReady = EReady;
//# sourceMappingURL=EReady.js.map