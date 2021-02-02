import {On} from "@typeit/discord";
import {GuildMember} from "discord.js";
import {onlineTimeService} from "../services/OnlineTimeService";
import {curseService} from "../services/CurseService";
import {UserPOJO} from "../pojo/UserPOJO";
import {CursePOJO} from "../pojo/CursePOJO";

export abstract class EGuildMemberAdd {
    localOnlinetimeService = onlineTimeService;
    localCurseService = curseService;

    @On("guildMemberAdd")
    addMembersToDatabases(member: GuildMember): void {
        this.localOnlinetimeService.insert(new UserPOJO(member.user.username, member.user.id, [], 0, 0, 0, [], 0, []));
        this.localCurseService.insert(new CursePOJO(member.user.username, member.user.id, 0, []));
    }
}
