import {Guard, On} from "@typeit/discord";
import {Presence} from "discord.js";
import {NotBotPresence} from "../guards/NotBot";
import {saveService} from "../services/SaveService";
import {UserPOJO} from "../pojo/UserPOJO";
import {DateTime} from "luxon";


export abstract class EPresence {
    /*
    @On("presenceUpdate")
    update(presence: Presence): void {
        if (!presence[1].user.bot) {
            LOGGER.log('info', {
                message: "User presence changed",
                username: presence[1].user.username,
                oldStatus: presence[0] ? presence[0].status : 'unknown',
                newStatus: presence[1].status
            });
        }
        const newPresence = presence[1];

        const changedUser = saveService.findUserActivity(newPresence.user.id);
        // If user that changed presence isnt found
        if (!changedUser) {
            //If the user isnt a bot and is online, add it to the file.
            if (!newPresence.user.bot && saveService.isOnline(newPresence.user.presence)) {
                saveService.addUserActivities(new UserPOJO(newPresence.user.username, newPresence.user.id, 0, DateTime.local().toISO(), true, 0))
            }
        } else {
            //todo not updating from online -> idle. Does update time but not minutes online. That means minutes are lost.

            // If the new presence is not online, calculate the time that he has been on for. Add that to the total amount of online minutes.
            if (!saveService.isOnline(newPresence.user.presence)) {
                const difference = DateTime.local().diff(changedUser.onlineSince, 'minutes');
                const onlineTimeInMinutes = difference.minutes;
                changedUser.totalMinutesOnline += onlineTimeInMinutes;
                changedUser.isOnline = false;
            } else {
                // Else, set the onlineSince to now
                changedUser.onlineSince = DateTime.local();
                changedUser.isOnline = true;
            }

            //Rewrite the file with new data.
            saveService.updateUserActivity(changedUser);
        }
    }
     */

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
