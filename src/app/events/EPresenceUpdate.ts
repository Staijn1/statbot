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
        const oldPresence = presence[0];
        const newPresence = presence[1];

        if (this.localOnlinetimeService.isOnline(newPresence)) {
            this.online(newPresence).then();
        } else {
            this.offline(newPresence).then()
        }
    }

    private async online(joinedPresence: Presence): Promise<void> {
        const timestampJoined = DateTime.local();
        const userChanged = await this.localOnlinetimeService.findOne({userid: joinedPresence.member.id});
        if (!userChanged) {
            this.localOnlinetimeService.insert(new UserPOJO(joinedPresence.member.user.id, joinedPresence.member.user.username, [{
                lastJoined: DateTime.local().toISO(),
                isOnline: true,
                minutes: 0
            }], 0, 0, 0, [{date: DateTime.local().toFormat(DATE_FORMAT), count: 0}], 0, []));
        }

        if (!userChanged.minutesOnlinePerDay) userChanged.minutesOnlinePerDay = []

        //Check if the user already joined today
        const todayInRecords = userChanged.minutesOnlinePerDay.find(day => timestampJoined.toFormat(DATE_FORMAT) === DateTime.fromISO(day.lastJoined).toFormat(DATE_FORMAT))
        if (todayInRecords) {
            todayInRecords.lastJoined = timestampJoined.toString();
            todayInRecords.isOnline = true;
        } else userChanged.minutesOnlinePerDay.push({lastJoined: timestampJoined.toString(), minutes: 0, isOnline: true});

        this.localOnlinetimeService.update({userid: userChanged.userid}, userChanged);
        LOGGER.info(`${joinedPresence.member.user.username} went online`)
    }

    private async offline(newPresence: Presence): Promise<void> {
        return
    }
}
