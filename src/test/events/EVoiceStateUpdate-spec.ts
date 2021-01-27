import {EVoiceStateUpdate} from "../../app/events/EVoiceStateUpdate";
import {Guild, VoiceState} from "discord.js";
import {Main} from "../../app/Main";
import {OnlineTimeServiceTest} from "../../app/services/OnlineTimeService";
import {UserPOJO} from "../../app/pojo/UserPOJO";
import {DateTime} from "luxon";

const guildStub = new Guild(Main.Client, {})
const voiceStateNull = new VoiceState(guildStub, {});
const voiceState = new VoiceState(guildStub, {})
Object.defineProperties(voiceState, {channelID: {value: 1}, member: {value: {id: '189022609399218176'}}})

const voiceStateJoined = [voiceStateNull, voiceState];
const voiceStateLeft = [voiceState, voiceStateNull];

let sut = new class extends EVoiceStateUpdate {
    inject(onlineTimeServiceTest: OnlineTimeServiceTest) {
        this.localOnlinetimeService = onlineTimeServiceTest;
    }
}

const testuser = new UserPOJO("Staijn", "189022609399218176", 0, "2021-01-26T10:58:09.651+00:00", false, 0, 0, [], 0, [])
beforeAll(() => {
    sut.inject(new OnlineTimeServiceTest('mocks/EVoiceStateUpdate-spec.nedb'))
    sut.localOnlinetimeService.remove({}, {multi: true});
    sut.localOnlinetimeService.insert(testuser);
})

beforeEach(() => {
    testuser.vcCountPerDay = [];
    testuser.vcCountPerDay.push({lastJoined: "2021-01-01T01:00:00.000+01:00", minutes: 60, isInVc: true})
})

test('should call userJoined because someone joined', () => {
    const spyOnUserJoined = jest.spyOn(EVoiceStateUpdate.prototype as any, 'userJoined');
    sut.updateVoicechatPresence(voiceStateJoined);

    expect(spyOnUserJoined).toHaveBeenCalled();
});

test('should call userLeft because someone left', () => {
    const spyOnUserLeft = jest.spyOn(EVoiceStateUpdate.prototype as any, 'userLeft');
    sut.updateVoicechatPresence(voiceStateLeft);

    expect(spyOnUserLeft).toHaveBeenCalled();
});

test('should not continue when user is not found, when user joins', async () => {
    const findSpy = jest.spyOn(sut.localOnlinetimeService, 'findOne').mockReturnValue(undefined);
    const updateSpy = jest.spyOn(sut.localOnlinetimeService, 'update');


    await sut.userJoined(voiceStateJoined[1]);
    expect(findSpy).toHaveBeenCalled();
    expect(updateSpy).not.toHaveBeenCalled();
});

test('should continue when vcCountPerDay does not exist, when user joins', async () => {
    const retVal = new UserPOJO("", "userid", 0, "", false, 0, 0, [], 0, []);
    delete retVal.vcCountPerDay;
    const findSpy = jest.spyOn(sut.localOnlinetimeService, 'findOne').mockReturnValue(Promise.resolve(retVal));
    const updateSpy = jest.spyOn(sut.localOnlinetimeService, 'update').mockImplementation(() => {
        console.log('mock')
    });

    await sut.userJoined(voiceStateJoined[1])
    expect(findSpy).toHaveBeenCalled();
    expect(updateSpy).toHaveBeenCalled();
});

test('should continue when vcCountPerDay does not exist, when user joins', async () => {
    const retVal = new UserPOJO("", "userid", 0, "", false, 0, 0, [], 0, []);
    delete retVal.vcCountPerDay;
    const findSpy = jest.spyOn(sut.localOnlinetimeService, 'findOne');
    const updateSpy = jest.spyOn(sut.localOnlinetimeService, 'update');

    await sut.userJoined(voiceStateJoined[1])
    expect(findSpy).toHaveBeenCalled();
    expect(updateSpy).toHaveBeenCalled();
});

test('should add a day to records, because it doesnt exist yet.', async () => {
    const expectedTime = DateTime.fromObject({
        year: 2021,
        month: 1,
        day: 1,
        hour: 1,
        minute: 0,
        second: 0,
        millisecond: 0
    });
    const timeSpy = jest.spyOn(DateTime, 'local').mockReturnValue(expectedTime)
    const findSpy = jest.spyOn(sut.localOnlinetimeService, 'findOne').mockReturnValue(Promise.resolve(testuser));
    const updateSpy = jest.spyOn(sut.localOnlinetimeService, 'update');
    await sut.userJoined(voiceStateJoined[1])


    const resultInDb = await sut.localOnlinetimeService.findOne({userid: '189022609399218176'});
    expect(findSpy).toHaveBeenCalled();
    expect(updateSpy).toHaveBeenCalled();
    expect(JSON.stringify(resultInDb)).toEqual(JSON.stringify(testuser))
});

test('should add 60 minutes to minutes online on the same day', async () => {
    const timeLeft = DateTime.fromObject({
        year: 2021,
        month: 1,
        day: 1,
        hour: 2,
        minute: 0,
        second: 0,
        millisecond: 0
    });
    jest.spyOn(DateTime, 'local').mockReturnValue(timeLeft)
    const findSpy = jest.spyOn(sut.localOnlinetimeService, 'findOne');
    const updateSpy = jest.spyOn(sut.localOnlinetimeService, 'update');
    await sut.userLeft(voiceStateJoined[1])

    const resultInDb = await sut.localOnlinetimeService.findOne({userid: '189022609399218176'});
    testuser.vcCountPerDay[0].minutes = 60;

    expect(findSpy).toHaveBeenCalled();
    expect(updateSpy).toHaveBeenCalled();
    expect(JSON.stringify(resultInDb)).toEqual(JSON.stringify(testuser))
});

test('should add 24 hours in minutes, to the existing 60 minutes', async () => {
    const timeLeft = DateTime.fromObject({
        year: 2021,
        month: 1,
        day: 2,
        hour: 1,
        minute: 0,
        second: 0,
        millisecond: 0
    });
    jest.spyOn(DateTime, 'local').mockReturnValue(timeLeft)
    const findSpy = jest.spyOn(sut.localOnlinetimeService, 'findOne').mockReturnValue(Promise.resolve(testuser));
    const updateSpy = jest.spyOn(sut.localOnlinetimeService, 'update');
    await sut.userLeft(voiceStateJoined[1])

    const resultInDb = await sut.localOnlinetimeService.findOne({userid: '189022609399218176'});
    testuser.vcCountPerDay[0].minutes = 1440;
    testuser.vcCountPerDay[1].minutes = 60;

    expect(findSpy).toHaveBeenCalled();
    expect(updateSpy).toHaveBeenCalled();
    expect(JSON.stringify(resultInDb)).toEqual(JSON.stringify(testuser));

});

test('should add 49 hours in minutes, to the existing 60 minutes', async () => {
    const timeLeft = DateTime.fromObject({
        year: 2021,
        month: 1,
        day: 3,
        hour: 2,
        minute: 0,
        second: 0,
        millisecond: 0
    });
    jest.spyOn(DateTime, 'local').mockReturnValue(timeLeft)
    const findSpy = jest.spyOn(sut.localOnlinetimeService, 'findOne').mockReturnValue(Promise.resolve(testuser));
    const updateSpy = jest.spyOn(sut.localOnlinetimeService, 'update');
    await sut.userLeft(voiceStateJoined[1])

    const resultInDb = await sut.localOnlinetimeService.findOne({userid: '189022609399218176'});

    expect(findSpy).toHaveBeenCalled();
    expect(updateSpy).toHaveBeenCalled();
    expect(resultInDb.vcCountPerDay.length).toEqual(3)
    expect(resultInDb.vcCountPerDay[0].minutes).toEqual(1440);
    expect(resultInDb.vcCountPerDay[1].minutes).toEqual(1440);
    expect(resultInDb.vcCountPerDay[2].minutes).toEqual(120)
});

afterAll(() => {
    sut = undefined;
})
