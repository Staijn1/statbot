import {it} from "mocha";
import {expect, use} from 'chai';
import {saveService} from "../../src/app/services/SaveService";
import * as path from "path";
import {UserPOJO} from "../../src/app/pojo/UserPOJO";
import {DateTime} from "luxon";
import {Presence, User} from "discord.js";
import {Main} from "../../src/app/Main";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const chai = require('chai');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const spies = require('chai-spies');
use(spies);

describe("SaveService", () => {
    saveService.FILE_LOCATION = path.join(__dirname, "..", "..", "src/assets/data/mocks/mockeddata.json");
    const parseJSONSpy = chai.spy(saveService.parseJson);
    console.log(saveService.FILE_LOCATION)
    before(() => {
        saveService.users = [];
        const testUser = JSON.parse("{\"username\":\"Eliii\",\"userid\":\"363384101794873354\",\"totalMinutesOnline\":0,\"onlineSince\":\"2021-01-14T01:01:07.207+01:00\"}");
        saveService.addUserActivities(new UserPOJO(testUser.username, testUser.userid, testUser.totalMinutesOnline, testUser.onlineSince))
        saveService.parseJson();
    })

    it('should be created', () => {
        expect(saveService).to.exist;
        //Check if data is loaded from mocked data
        expect(saveService.users.length).to.equal(1);
    });

    it('should not return user when userid is not found', () => {
        const result = saveService.findUserActivity('1234');
        expect(result).to.not.exist;
    });

    it('should return userPOJO when userid is found', () => {
        const result = saveService.findUserActivity('363384101794873354');
        expect(result).to.exist;
        expect(result).to.be.instanceOf(UserPOJO)
    });

    it('should call parseJSON when finding user', () => {
        saveService.findUserActivity('123');
        expect(parseJSONSpy).to.have.been.called;
    });

    it('should add user to array', () => {
        const userToAdd = new UserPOJO('username', 'id', 0, DateTime.local().toISO());
        const currentArrayLength = saveService.users.length;
        saveService.addUserActivities(userToAdd);
        expect(saveService.users.length).to.equal(currentArrayLength + 1);
    });

    it('should return true because user is online', () => {
        const onlineStatus = {status: "online"}
        expect(saveService.isOnline(onlineStatus as Presence)).to.be.true;
        const doNotDisturb = {status: "dnd"}
        expect(saveService.isOnline(doNotDisturb as Presence)).to.be.true;
    });

    it('should return false because user is not online', () => {
        const idleStatus = {status: "idle"}
        expect(saveService.isOnline(idleStatus as Presence)).to.be.false;
        const doNotDisturb = {status: "offline"}
        expect(saveService.isOnline(doNotDisturb as Presence)).to.be.false;
    });

    it('should update existing user in user array AND in file', () => {
        const userToUpdate = new UserPOJO('Eliii', '363384101794873354', 10, '2021-01-14T01:11:07.207+01:00');
        saveService.updateUserActivity(userToUpdate);
        expect(saveService.users[0]).to.equal(userToUpdate);
        
    });
});
