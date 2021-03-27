import {On} from "@typeit/discord";
import {GuildMember} from "discord.js";
import {onlineTimeService} from "../services/OnlineTimeService";
import {curseService} from "../services/CurseService";
import {UserPOJO} from "../pojo/UserPOJO";
import {CursePOJO} from "../pojo/CursePOJO";
import {DateTime} from "luxon";
import {DATE_FORMAT, LOGGER} from "../utils/constants";

export abstract class EGuildMemberAdd {
    localOnlinetimeService = onlineTimeService;
    localCurseService = curseService;

    @On("guildMemberAdd")
    addMembersToDatabases(memberUpdate: GuildMember[]): void {
        const member = memberUpdate[0]
        LOGGER.info(`Member ${member.user.username} joined guild ${member.guild.name}`)
        this.localOnlinetimeService.insert(new UserPOJO(member.user.username, member.user.id, [{
            lastJoined: DateTime.local().toISO(),
            minutes: 0,
            isOnline: onlineTimeService.isOnline(member.user.presence)
        }], 0, 0, 0, [{
            date: DateTime.local().toFormat(DATE_FORMAT),
            count: 0
        }
        ], 0, [
            {lastJoined: DateTime.local().toISO(), minutes: 0, isInVc: false}
        ]));
        this.localCurseService.insert(new CursePOJO(member.user.username, member.user.id, 0, [{
            date: DateTime.local().toFormat(DATE_FORMAT),
            count: 0
        }]));
    }
}
