import {onlineTimeService} from "../../app/services/OnlineTimeService";
import {UserPOJO} from "../../app/pojo/UserPOJO";
import {Presence} from "discord.js";
import {DateTime} from "luxon";
import * as path from "path";


onlineTimeService.FILE_LOCATION = path.join(__dirname, "..", '..', "assets/data/mocks/mockeddata.json");
jest.disableAutomock();
beforeAll(() => {
    onlineTimeService.users = [];
    const testUser = JSON.parse("{\"username\":\"Eliii\",\"userid\":\"363384101794873354\",\"totalMinutesOnline\":0,\"onlineSince\":\"2021-01-14T01:01:07.207+01:00\"}");
    onlineTimeService.addUserActivities(new UserPOJO(testUser.username, testUser.userid, testUser.totalMinutesOnline, testUser.onlineSince, true, 0, 0, 0))
    onlineTimeService.parseJson();
})

test('should be created', () => {
    expect(onlineTimeService).toBeTruthy();
    //Check if data is loaded from mocked data
    expect(onlineTimeService.users.length).toBe(1);
});

test('should not return user when userid is not found', () => {
    const result = onlineTimeService.findUserActivity('1234');
    expect(result).toBeFalsy();
});

test('should return userPOJO when userid is found', () => {
    const result = onlineTimeService.findUserActivity('363384101794873354');
    expect(result).toBeTruthy();
    expect(result).toBeInstanceOf(UserPOJO);
});

test('should call parseJSON when finding user', () => {
    const spy = jest.spyOn(onlineTimeService, "parseJson");
    onlineTimeService.findUserActivity('123');
    expect(spy).toHaveBeenCalled()
});

test('should add user to array', () => {
    const userToAdd = new UserPOJO('username', 'id', 0, DateTime.local().toISO(), true, 0, 0, 0);
    const currentArrayLength = onlineTimeService.users.length;
    onlineTimeService.addUserActivities(userToAdd);
    expect(onlineTimeService.users.length).toBe(currentArrayLength + 1);
});

test('should return true because user is online', () => {
    const onlineStatus = {status: "online"}
    expect(onlineTimeService.isOnline(onlineStatus as Presence)).toBeTruthy();
    const doNotDisturb = {status: "dnd"}
    expect(onlineTimeService.isOnline(doNotDisturb as Presence)).toBeTruthy()
    const idleStatus = {status: "idle"}
    expect(onlineTimeService.isOnline(idleStatus as Presence)).toBeTruthy()
});

test('should return false because user is not online', () => {
    const doNotDisturb = {status: "offline"}
    expect(onlineTimeService.isOnline(doNotDisturb as Presence)).toBeFalsy()
});

test('should update existing user in user array AND in file', () => {
    const userToUpdate = new UserPOJO('Eliii', '363384101794873354', 10, '2021-01-14T01:11:07.207+01:00', true, 0, 0, 0);
    onlineTimeService.updateUserActivity(userToUpdate);
    expect(JSON.stringify(onlineTimeService.users[0])).toBe(JSON.stringify(userToUpdate));

    //This will clear the users array and read it again.
    onlineTimeService.parseJson();
    expect(JSON.stringify(onlineTimeService.users[0])).toBe(JSON.stringify(userToUpdate));
});

test('should do nothing when updating non existing user', () => {
    const userToUpdate = new UserPOJO('Eliii', 'sdf', 10, '2021-01-14T01:11:07.207+01:00', true, 0, 0, 0);
    const currentUsers = onlineTimeService.users;
    onlineTimeService.updateUserActivity(userToUpdate);

    expect(JSON.stringify(onlineTimeService.users)).toBe(JSON.stringify(currentUsers));
    //This will clear the users array and read it again.
    onlineTimeService.parseJson();
    expect(JSON.stringify(onlineTimeService.users)).toBe(JSON.stringify(currentUsers));
});

test('updateOnlineTime should not update time if users are online', () => {
    onlineTimeService.updateOnlineTime()
    const calculateTimeSpy = spyOn(onlineTimeService, "calculateTimeDifferenceInMinutes");
    expect(calculateTimeSpy).not.toHaveBeenCalled();
});


