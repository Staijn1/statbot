import {On} from "@typeit/discord";
import {GuildMember} from "discord.js";
import {onlineTimeService} from "../services/OnlineTimeService";
import {curseService} from "../services/CurseService";
import {LOGGER} from "../utils/constants";

export abstract class EGuildMemberRemove {
    @On("guildMemberRemove")
    removeMemberFromMemory(member: GuildMember): void {
        member = member[0];
        LOGGER.info(`Member ${member.user.username} left guild ${member.guild.name}`)
        onlineTimeService.remove({userid: member.user.id});
        curseService.remove({userid: member.user.id});
    }
}
