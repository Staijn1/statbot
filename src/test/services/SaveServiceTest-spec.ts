import {saveService} from "../../app/services/SaveService";
import {UserPOJO} from "../../app/pojo/UserPOJO";
import {Presence} from "discord.js";
import {DateTime} from "luxon";
import * as path from "path";


saveService.FILE_LOCATION = path.join(__dirname, "..", '..', "assets/data/mocks/mockeddata.json");
jest.disableAutomock();
beforeAll(() => {
    saveService.users = [];
    const testUser = JSON.parse("{\"username\":\"Eliii\",\"userid\":\"363384101794873354\",\"totalMinutesOnline\":0,\"onlineSince\":\"2021-01-14T01:01:07.207+01:00\"}");
    saveService.addUserActivities(new UserPOJO(testUser.username, testUser.userid, testUser.totalMinutesOnline, testUser.onlineSince, true))
    saveService.parseJson();
})

test('should be created', () => {
    expect(saveService).toBeTruthy();
    //Check if data is loaded from mocked data
    expect(saveService.users.length).toBe(1);
});

test('should not return user when userid is not found', () => {
    const result = saveService.findUserActivity('1234');
    expect(result).toBeFalsy();
});

test('should return userPOJO when userid is found', () => {
    const result = saveService.findUserActivity('363384101794873354');
    expect(result).toBeTruthy();
    expect(result).toBeInstanceOf(UserPOJO);
});

test('should call parseJSON when finding user', () => {
    const spy = jest.spyOn(saveService, "parseJson");
    saveService.findUserActivity('123');
    expect(spy).toHaveBeenCalled()
});

test('should add user to array', () => {
    const userToAdd = new UserPOJO('username', 'id', 0, DateTime.local().toISO(), true);
    const currentArrayLength = saveService.users.length;
    saveService.addUserActivities(userToAdd);
    expect(saveService.users.length).toBe(currentArrayLength + 1);
});

test('should return true because user is online', () => {
    const onlineStatus = {status: "online"}
    expect(saveService.isOnline(onlineStatus as Presence)).toBeTruthy();
    const doNotDisturb = {status: "dnd"}
    expect(saveService.isOnline(doNotDisturb as Presence)).toBeTruthy()
    const idleStatus = {status: "idle"}
    expect(saveService.isOnline(idleStatus as Presence)).toBeTruthy()
});

test('should return false because user is not online', () => {
    const doNotDisturb = {status: "offline"}
    expect(saveService.isOnline(doNotDisturb as Presence)).toBeFalsy()
});

test('should update existing user in user array AND in file', () => {
    const userToUpdate = new UserPOJO('Eliii', '363384101794873354', 10, '2021-01-14T01:11:07.207+01:00', true);
    saveService.updateUserActivity(userToUpdate);
    expect(JSON.stringify(saveService.users[0])).toBe(JSON.stringify(userToUpdate));

    //This will clear the users array and read it again.
    saveService.parseJson();
    expect(JSON.stringify(saveService.users[0])).toBe(JSON.stringify(userToUpdate));
});

test('should do nothing when updating non existing user', () => {
    const userToUpdate = new UserPOJO('Eliii', 'sdf', 10, '2021-01-14T01:11:07.207+01:00', true);
    const currentUsers = saveService.users;
    saveService.updateUserActivity(userToUpdate);

    expect(JSON.stringify(saveService.users)).toBe(JSON.stringify(currentUsers));
    //This will clear the users array and read it again.
    saveService.parseJson();
    expect(JSON.stringify(saveService.users)).toBe(JSON.stringify(currentUsers));
});

