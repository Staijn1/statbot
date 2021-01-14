import {On} from "@typeit/discord";
import {saveService} from "../services/SaveService";
import {UserPOJO} from "../pojo/UserPOJO";
import {DateTime} from "luxon";
import {Presence} from "discord.js";


export abstract class Ready {
    @On("presenceUpdate")
    update(presence: Presence): void {
        const newPresence = presence[1];

        const changedUser = saveService.findUserActivity(newPresence.user.id);
        // If user that changed presence isnt found
        if (!changedUser) {
            //todo build logger
            //If the user isnt a bot and is online, add it to the file.
            const iets = newPresence.user.presence;
            if (!newPresence.user.bot && saveService.isOnline(newPresence.user.presence)) {
                console.log("Adding user: ", newPresence.user.username)
                saveService.addUserActivities(new UserPOJO(newPresence.user.username, newPresence.user.id, 0, DateTime.local().toISO()))
            }
        } else {
            // If the new presence is not online, calculate the time that he has been on for. Add that to the total amount of online minutes.
            if (!saveService.isOnline(newPresence.user.presence)) {
                const difference = DateTime.local().diff(changedUser.onlineSince, 'minutes');
                const onlineTimeInMinutes = difference.minutes;
                changedUser.totalMinutesOnline += changedUser.totalMinutesOnline + onlineTimeInMinutes;
            } else {
                // Else, set the onlineSince to now
                changedUser.onlineSince = DateTime.local();
            }

            //Rewrite the file with new data.
            saveService.updateUserActivity(changedUser);
        }
    }
}
