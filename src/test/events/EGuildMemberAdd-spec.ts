import {EGuildMemberAdd} from "../../app/events/EGuildMemberAdd";
import {OnlineTimeServiceTest} from "../../app/services/OnlineTimeService";
import {CurseServiceTest} from "../../app/services/CurseService";
import {GuildMember} from "discord.js";

let sut = new class extends EGuildMemberAdd {
    inject() {
        this.localOnlinetimeService = new OnlineTimeServiceTest()
        this.localCurseService = new CurseServiceTest();
    }
}

beforeAll(() => {
    sut.inject();
})

test('should add user to user database', () => {
    const onlineTimeSpy = jest.spyOn(sut.localOnlinetimeService, 'insert').mockImplementation(() => {
        console.log('called online service')
    })

    sut.addMembersToDatabases({user: {username: "Testuser", id: 'testid'}} as GuildMember)
    expect(onlineTimeSpy).toHaveBeenCalledTimes(1);
})

test('should add user to curse database', () => {
    const curseSpy = jest.spyOn(sut.localCurseService, 'insert').mockImplementation(() => {
        console.log('called curse service')
    })

    sut.addMembersToDatabases({user: {username: "Testuser", id: 'testid'}} as GuildMember)

    expect(curseSpy).toHaveBeenCalledTimes(1);
})

afterAll(() => {
    sut = undefined;
})
