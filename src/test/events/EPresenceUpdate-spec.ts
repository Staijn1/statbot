import {Presence} from "discord.js";
import {Main} from "../../app/Main";
import {OnlineTimeServiceTest} from "../../app/services/OnlineTimeService";
import {UserPOJO} from "../../app/pojo/UserPOJO";
import {EPresenceUpdate} from "../../app/events/EPresenceUpdate";
import {DateTime} from "luxon";

jest.disableAutomock();
const presenceOnline = new Presence(Main.Client, {user: {id: '189022609399218176'}});
const presenceOffline = new Presence(Main.Client, {user: {id: '189022609399218176'}});

Object.defineProperties(presenceOnline, {
    status: {value: 'online'},
    user: {
        value: {
            username: 'Staijn',
            id: '189022609399218176'
        }
    }
})
Object.defineProperties(presenceOffline, {
    status: {value: 'offline'},
    user: {
        value: {
            username: 'Staijn',
            id: '189022609399218176'
        }
    }
})

const presencesOnline = [presenceOffline, presenceOnline];
const presencesOffline = [presenceOnline, presenceOffline];

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

test('should not call online because user is already online', async () => {
    const spyOnUserJoined = jest.spyOn(EPresenceUpdate.prototype as any, 'online');
    await sut.updatePresence(presencesOnline);

    expect(spyOnUserJoined).not.toHaveBeenCalled();
});

test('should call online because user went from offline to online', async () => {
    testuser.minutesOnlinePerDay[0].isOnline = false;
    const spyOnUserJoined = jest.spyOn(EPresenceUpdate.prototype as any, 'online');
    const findSpy = jest.spyOn(sut.localOnlinetimeService, 'findOne').mockImplementation(() => {
        return Promise.resolve(testuser)
    });

    await sut.updatePresence(presencesOnline);

    expect(spyOnUserJoined).toHaveBeenCalled();
});

test('should not call offline because someone was already offline', async () => {
    testuser.minutesOnlinePerDay[0].isOnline = false;
    const spyOnUserLeft = jest.spyOn(sut, 'offline');
    const findSpy = jest.spyOn(sut.localOnlinetimeService, 'findOne').mockReturnValue(Promise.resolve(testuser));

    await sut.updatePresence(presencesOffline);

    expect(spyOnUserLeft).not.toHaveBeenCalled();
});

test('should call offline because someone went from online to offline', async () => {
    const spyOnUserLeft = jest.spyOn(sut, 'offline');
    await sut.updatePresence(presencesOffline);

    expect(spyOnUserLeft).toHaveBeenCalled();
});

test('should continue when user is not found, add him before going any further, when user went online', async () => {
    const findSpy = jest.spyOn(sut.localOnlinetimeService, 'findOne').mockReturnValue(undefined);
    const insertSpy = jest.spyOn(sut.localOnlinetimeService, 'insert');
    const updateSpy = jest.spyOn(sut.localOnlinetimeService, 'update');


    await sut.online(presencesOnline[1]);
    expect(findSpy).toHaveBeenCalled();
    expect(insertSpy).toHaveBeenCalled();
    expect(updateSpy).toHaveBeenCalled();
});

test('should continue when minutesPerDay does not exist, when user joins', async () => {
    const retVal = new UserPOJO('Staijn', '189022609399218176', [], 0, 0, 0, [], 0, [])
    delete retVal.minutesOnlinePerDay;

    const findSpy = jest.spyOn(sut.localOnlinetimeService, 'findOne').mockReturnValue(Promise.resolve(retVal));
    const updateSpy = jest.spyOn(sut.localOnlinetimeService, 'update').mockImplementation(() => {
        console.log('mock')
    });

    await sut.online(presencesOnline[1])
    expect(findSpy).toHaveBeenCalled();
    expect(updateSpy).toHaveBeenCalled();
});

test('should add a day to records, because it doesnt exist yet', async () => {
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
    await sut.offline(presencesOnline[1])


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
    await sut.offline(presencesOnline[1])

    const resultInDb = await sut.localOnlinetimeService.findOne({userid: '189022609399218176'});
    testuser.minutesOnlinePerDay[0].minutes = 60;

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
    await sut.offline(presencesOnline[1])

    const resultInDb = await sut.localOnlinetimeService.findOne({userid: '189022609399218176'});
    testuser.minutesOnlinePerDay[0].minutes = 1440;
    testuser.minutesOnlinePerDay[1].minutes = 60;

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
    await sut.offline(presencesOnline[1])

    const resultInDb = await sut.localOnlinetimeService.findOne({userid: '189022609399218176'});

    expect(findSpy).toHaveBeenCalled();
    expect(updateSpy).toHaveBeenCalled();
    expect(resultInDb.minutesOnlinePerDay.length).toEqual(3)
    expect(resultInDb.minutesOnlinePerDay[0].minutes).toEqual(1440);
    expect(resultInDb.minutesOnlinePerDay[1].minutes).toEqual(1440);
    expect(resultInDb.minutesOnlinePerDay[2].minutes).toEqual(120)
});

afterAll(() => {
    sut = undefined;
})

