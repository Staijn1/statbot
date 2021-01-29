import {On} from "@typeit/discord";
import {GuildMember} from "discord.js";
import {onlineTimeService} from "../services/OnlineTimeService";
import {curseService} from "../services/CurseService";
import {UserPOJO} from "../pojo/UserPOJO";
import {CursePOJO} from "../pojo/CursePOJO";

export abstract class EGuildMemberRemove {
    @On("guildMemberAdd")
    removeMemberFromMemory(member: GuildMember): void {
        onlineTimeService.insert(new UserPOJO(member.user.username, member.user.id, [], 0, 0, 0, [], 0, []));
        curseService.insert(new CursePOJO(member.user.username, member.user.id, 0, []));
    }
}
