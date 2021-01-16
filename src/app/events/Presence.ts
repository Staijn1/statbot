import {Guard, On} from "@typeit/discord";
import {Presence} from "discord.js";
import {NotBotPresence} from "../guards/NotBot";
import {saveService} from "../services/SaveService";
import {UserPOJO} from "../pojo/UserPOJO";
import {DateTime} from "luxon";


export abstract class EPresence {

    @On('presenceUpdate')
    @Guard(NotBotPresence)
    updatePresence(presence: Presence): void {
        const newPresence = presence[1];

        const changedUser = saveService.findUserActivity(newPresence.user.id);
        // If this user does not exist yet and went online, add him
        if (!changedUser && saveService.isOnline(newPresence)){
            saveService.addUserActivities(new UserPOJO(newPresence.user.username, newPresence.user.id, 0, DateTime.local().toISO(), true, 0));
            return;
        }

        const wasPreviousStateOnline = changedUser.isOnline;
        if (wasPreviousStateOnline && !saveService.isOnline(newPresence)) {
            changedUser.isOnline = false;
            changedUser.totalMinutesOnline += saveService.calculateTimeDifferenceInMinutes(changedUser.onlineSince);
            saveService.updateUserActivity(changedUser);
        } else if(!wasPreviousStateOnline && saveService.isOnline(newPresence)){
            changedUser.isOnline = true;
            changedUser.onlineSince = DateTime.local();
            saveService.updateUserActivity(changedUser);
        }
    }
}
