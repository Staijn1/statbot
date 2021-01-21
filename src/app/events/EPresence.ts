import {Guard, On} from "@typeit/discord";
import {Presence} from "discord.js";
import {NotBotPresence} from "../guards/NotBot";
import {onlineTimeService} from "../services/OnlineTimeService";
import {UserPOJO} from "../pojo/UserPOJO";
import {DateTime} from "luxon";


export abstract class EPresence {

    @On('presenceUpdate')
    @Guard(NotBotPresence)
    async updatePresence(presence: Presence): Promise<void> {
        const newPresence = presence[1];
        const changedUser = await onlineTimeService.findOne({userid: newPresence.user.id});

        // If this user does not exist yet and went online, add him
        if (!changedUser && onlineTimeService.isOnline(newPresence)) {
            onlineTimeService.addUserActivities(new UserPOJO(newPresence.user.username, newPresence.user.id, 0, DateTime.local().toISO(), true, 0, 0));
            return;
        } else if(!changedUser) return;

        const wasPreviousStateOnline = changedUser.isOnline;
        if (wasPreviousStateOnline && !onlineTimeService.isOnline(newPresence)) {
            changedUser.isOnline = false;
            changedUser.totalMinutesOnline += onlineTimeService.calculateTimeDifferenceInMinutes(changedUser.onlineSince)
            onlineTimeService.update({userid: changedUser.userid}, changedUser);
        } else if (!wasPreviousStateOnline && onlineTimeService.isOnline(newPresence)) {
            changedUser.isOnline = true;
            changedUser.onlineSince = DateTime.local().toISO();
            onlineTimeService.update({userid: changedUser.userid}, changedUser);
        }
    }
}
