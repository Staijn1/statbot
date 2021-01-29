import {Guard, On} from "@typeit/discord";
import {Presence} from "discord.js";
import {NotBotPresence} from "../guards/NotBot";
import {onlineTimeService} from "../services/OnlineTimeService";
import {DateTime} from "luxon";
import {DATE_FORMAT, LOGGER} from "../utils/constants";
import {UserPOJO} from "../pojo/UserPOJO";


export abstract class EPresenceUpdate {
    localOnlinetimeService = onlineTimeService;

    @On('presenceUpdate')
    @Guard(NotBotPresence)
    async updatePresence(presence: Presence[]): Promise<void> {
        const newPresence = presence[1];
        const user = await this.localOnlinetimeService.findOne({userid: newPresence.userID});
        const nowOnline = this.localOnlinetimeService.isOnline(newPresence)
        try {
            const wasOnline = user.minutesOnlinePerDay[user.minutesOnlinePerDay.length - 1].isOnline;

            if (!wasOnline && nowOnline) {
                await this.online(newPresence);
            } else if (wasOnline && !nowOnline) {
                await this.offline(newPresence);
            }
        } catch (e) {
            if (nowOnline) await this.online(newPresence)
        }
    }

    async online(joinedPresence: Presence): Promise<void> {
        const timestampJoined = DateTime.local();
        let userChanged = await this.localOnlinetimeService.findOne({userid: joinedPresence.user.id});
        if (!userChanged) {
            userChanged = new UserPOJO(joinedPresence.user.username, joinedPresence.user.id, [{
                lastJoined: DateTime.local().toISO(),
                isOnline: true,
                minutes: 0
            }], 0, 0, 0, [{date: DateTime.local().toFormat(DATE_FORMAT), count: 0}], 0, [])
            this.localOnlinetimeService.insert(userChanged);
        }

        if (!userChanged.minutesOnlinePerDay) userChanged.minutesOnlinePerDay = []

        //Check if the user already joined today
        const todayInRecords = userChanged.minutesOnlinePerDay.find(day => timestampJoined.toFormat(DATE_FORMAT) === DateTime.fromISO(day.lastJoined).toFormat(DATE_FORMAT))
        if (todayInRecords) {
            todayInRecords.lastJoined = timestampJoined.toString();
            todayInRecords.isOnline = true;
        } else userChanged.minutesOnlinePerDay.push({
            lastJoined: timestampJoined.toString(),
            minutes: 0,
            isOnline: true
        });

        this.localOnlinetimeService.update({userid: userChanged.userid}, userChanged);
        LOGGER.info(`${joinedPresence.user.username} went online`)
    }

    async offline(leftPresence: Presence): Promise<void> {
        const timestampLeft = DateTime.local();
        const userChanged = await this.localOnlinetimeService.findOne({userid: leftPresence.user.id});
        if (!userChanged || !userChanged.minutesOnlinePerDay) return;


        const lastKnownRecord = userChanged.minutesOnlinePerDay[userChanged.minutesOnlinePerDay.length - 1];
        const timeJoinedObject = DateTime.fromISO(lastKnownRecord.lastJoined);
        let timeSpentOnline = timestampLeft.diff(timeJoinedObject, "minutes").minutes;
        const timeUntilMidnightFromOnlinetimestamp = DateTime.fromObject({
            year: timeJoinedObject.year,
            month: timeJoinedObject.month,
            day: timeJoinedObject.day + 1,
            hour: 0,
            minute: 0,
            second: 0
        }).diff(timeJoinedObject, 'minutes').minutes;

        // If we did not pass midnight while online, add the time to the day we joined
        if (timeSpentOnline < timeUntilMidnightFromOnlinetimestamp) {
            lastKnownRecord.minutes += timeSpentOnline;
        } else {
            timeSpentOnline -= timeUntilMidnightFromOnlinetimestamp;
            lastKnownRecord.minutes += timeUntilMidnightFromOnlinetimestamp;
            let dayOnline = timeJoinedObject.plus({day: 1});
            while ((timeSpentOnline - 1440) > 0) {
                userChanged.minutesOnlinePerDay.push({lastJoined: dayOnline.toISO(), minutes: 1440, isOnline: false});
                dayOnline = dayOnline.plus({day: 1});
                timeSpentOnline -= 1440;
            }
            // If we have minutes left, add them to the remaining day
            if (timeSpentOnline >= 0) userChanged.minutesOnlinePerDay.push({
                lastJoined: dayOnline.toISO(),
                minutes: timeSpentOnline,
                isOnline: false
            });
        }
        lastKnownRecord.isOnline = false;
        this.localOnlinetimeService.update({userid: userChanged.userid}, userChanged);
        LOGGER.info(`${leftPresence.user.username} went offline`)
    }
}
