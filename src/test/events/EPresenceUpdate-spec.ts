import {Presence} from "discord.js";
import {Main} from "../../app/Main";
import {OnlineTimeServiceTest} from "../../app/services/OnlineTimeService";
import {UserPOJO} from "../../app/pojo/UserPOJO";
import {EPresenceUpdate} from "../../app/events/EPresenceUpdate";


const presenceOnline = new Presence(Main.Client, {});
const presenceOffline = new Presence(Main.Client, {});
Object.defineProperties(presenceOnline, {member: {value: {id: '189022609399218176'}}})
Object.defineProperties(presenceOffline, {member: {value: {id: '189022609399218176'}}})
const voiceStateJoined = [presenceOffline, presenceOnline];
const voiceStateLeft = [presenceOnline, presenceOffline];

let sut = new class extends EPresenceUpdate {
    inject(onlineTimeServiceTest: OnlineTimeServiceTest) {
        this.localOnlinetimeService = onlineTimeServiceTest;
    }
}

const testuser = new UserPOJO('Staijn', '189022609399218176', [{
    lastJoined: '2021-01-26T10:58:09.651+00:00',
    minutes: 0,
    isOnline: true
}], 0, 0, 0, [], 0, [])
beforeAll(() => {
    sut.inject(new OnlineTimeServiceTest('mocks/EPresenceUpdate-spec.nedb'))
    sut.localOnlinetimeService.remove({}, {multi: true});
    sut.localOnlinetimeService.insert(testuser);
})

beforeEach(() => {
    testuser.minutesOnlinePerDay = [];
    testuser.minutesOnlinePerDay.push({lastJoined: "2021-01-01T01:00:00.000+01:00", minutes: 60, isOnline: true})
})

test('should call online because someone went online', () => {
    const spyOnUserJoined = jest.spyOn(EPresenceUpdate.prototype as any, 'online');
    sut.updatePresence(voiceStateJoined);

    expect(spyOnUserJoined).toHaveBeenCalled();
});

afterAll(() => {
    sut = undefined;
})
