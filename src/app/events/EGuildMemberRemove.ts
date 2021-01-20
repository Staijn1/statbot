import {On} from "@typeit/discord";
import {GuildMember} from "discord.js";
import {onlineTimeService} from "../services/OnlineTimeService";
import {curseService} from "../services/CurseService";

export abstract class EGuildMemberRemove {
    @On("guildMemberRemove")
    removeMemberFromMemory(member: GuildMember): void {
        onlineTimeService.remove({userid: member[0].user.id});
        curseService.remove({userid: member[0].user.id});
    }
}
