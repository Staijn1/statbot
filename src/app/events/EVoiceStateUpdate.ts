import {Guard, On} from "@typeit/discord";
import {NotBotVoice} from "../guards/NotBot";
import {VoiceState} from "discord.js";
import {DateTime} from "luxon";
import {onlineTimeService} from "../services/OnlineTimeService";
import {DATE_FORMAT, LOGGER} from "../utils/constants";


export abstract class EVoiceStateUpdate {
    public localOnlinetimeService = onlineTimeService;

    @On('voiceStateUpdate')
    @Guard(NotBotVoice)
    updateVoicechatPresence(voiceState: VoiceState[]): void {
        const oldStateChannel = voiceState[0].channelID == null ? undefined : voiceState[0].channelID;
        const newStateChannel = voiceState[1].channelID == null ? undefined : voiceState[1].channelID;


        if (!oldStateChannel && newStateChannel) {
            this.userJoined(voiceState[1]).then();
        } else if (!newStateChannel) {
            this.userLeft(voiceState[1]).then()
        }

    }

    async userJoined(joinedVcState: VoiceState): Promise<void> {
        const timestampJoined = DateTime.local();
        const userChanged = await this.localOnlinetimeService.findOne({userid: joinedVcState.member.id});
        if (!userChanged) return;

        if (!userChanged.vcCountPerDay) userChanged.vcCountPerDay = []

        //Check if the user already joined today
        const todayInRecords = userChanged.vcCountPerDay.find(day => timestampJoined.toFormat(DATE_FORMAT) === DateTime.fromISO(day.lastJoined).toFormat(DATE_FORMAT))
        if (todayInRecords){
            todayInRecords.lastJoined = timestampJoined.toString();
            todayInRecords.isInVc = true;
        }
        else userChanged.vcCountPerDay.push({lastJoined: timestampJoined.toString(), minutes: 0, isInVc: true});

        this.localOnlinetimeService.update({userid: userChanged.userid}, userChanged);
        LOGGER.info(`${joinedVcState.member.user.username} joined voicechat`)
    }

    async userLeft(leftVcState: VoiceState): Promise<void> {
        const timestampLeft = DateTime.local();
        const userChanged = await this.localOnlinetimeService.findOne({userid: leftVcState.member.id});
        if (!userChanged || !userChanged.vcCountPerDay) return;


        const lastKnownRecord = userChanged.vcCountPerDay[userChanged.vcCountPerDay.length - 1];
        const timeJoinedObject = DateTime.fromISO(lastKnownRecord.lastJoined);
        let timeSpentInVc = timestampLeft.diff(timeJoinedObject, "minutes").minutes;
        const timeUntilMidnightFromJoinTime = DateTime.fromObject({
            year: timeJoinedObject.year,
            month: timeJoinedObject.month,
            day: timeJoinedObject.day + 1,
            hour: 0,
            minute: 0,
            second: 0
        }).diff(timeJoinedObject, 'minutes').minutes;

        // If we did not pass midnight while in vc, add the time to the day we joined
        if (timeSpentInVc < timeUntilMidnightFromJoinTime) {
            lastKnownRecord.minutes += timeSpentInVc;
        }
        else {
            timeSpentInVc -= timeUntilMidnightFromJoinTime;
            lastKnownRecord.minutes += timeUntilMidnightFromJoinTime;
            let dayInVc = timeJoinedObject.plus({day: 1});
            while ((timeSpentInVc - 1440) > 0) {
                userChanged.vcCountPerDay.push({lastJoined: dayInVc.toISO(), minutes: 1440, isInVc: false});
                dayInVc = dayInVc.plus({day: 1});
                timeSpentInVc -= 1440;
            }
            // If we have minutes left, add them to the remaining day
            if (timeSpentInVc >= 0) userChanged.vcCountPerDay.push({lastJoined: dayInVc.toISO(), minutes: timeSpentInVc, isInVc: false});
        }
        lastKnownRecord.isInVc = false;
        this.localOnlinetimeService.update({userid: userChanged.userid}, userChanged);
        LOGGER.info(`${leftVcState.member.user.username} left voicechat`)
    }
}
