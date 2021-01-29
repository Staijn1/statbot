import {OnlineTimeServiceTest} from "../../app/services/OnlineTimeService";


const sut = new OnlineTimeServiceTest('mocks/mockedactivity.nedb');

beforeAll(() => {
    // Removing all documents with the 'match-all' query
    // sut.remove({}, { multi: true });
});

/*
test('should not return user when userid is not found', async () => {
    const result = await sut.findOne({userid: '1234'});
    expect(result).toBeUndefined();
});

test('should return userPOJO when userid is found', async () => {
    //todo repair

    const result = await sut.findOne({userid: '363384101794873354'});
    expect(result).toBeInstanceOf(UserPOJO);
});

test('should add user to database', async () => {
    const userToAdd = new UserPOJO('username', 'id', 0, DateTime.local().toISO(), true, 0, 0, [], 0, []);
    const usersInDatabaseBefore = await sut.findAll();
    const beforeArrayLength = usersInDatabaseBefore.length;
    sut.addUserActivities(userToAdd);
    const usersInDatabaseAfter = await sut.findAll();
    const currentArrayLength = usersInDatabaseAfter.length;
    expect(currentArrayLength).toBe(beforeArrayLength + 1);
});

test('should return true because user is online', () => {
    const onlineStatus = {status: "online"}
    expect(sut.isOnline(onlineStatus as Presence)).toBeTruthy();
    const doNotDisturb = {status: "dnd"}
    expect(sut.isOnline(doNotDisturb as Presence)).toBeTruthy()
    const idleStatus = {status: "idle"}
    expect(sut.isOnline(idleStatus as Presence)).toBeTruthy()
});

test('should return false because user is not online', () => {
    const doNotDisturb = {status: 'offline'}
    expect(sut.isOnline(doNotDisturb as Presence)).toBe(false)
});

test('should update existing user in database', async () => {
   //todo repair

   const userToUpdate = new UserPOJO('Eliii', '363384101794873354', 10, '2021-01-14T01:11:07.207+01:00', true, 0, 0, [], 0, []);
   const expectedJSON = JSON.stringify(userToUpdate);
   sut.update({userid: ' 363384101794873354'}, userToUpdate);

   const received = await sut.findOne({userid: '363384101794873354'})
   expect(JSON.stringify(received)).toBe(expectedJSON);


});
*/
/*
test('should do nothing when updating non existing user', async () => {
    const userToUpdate = new UserPOJO('Eliii', 'sdf', 10, '2021-01-14T01:11:07.207+01:00', true, 0, 0, [], 0, []);
    const usersBeforeUpdate = await sut.findAll();
    sut.update({userid: 'sdf'}, userToUpdate);

    const usersAfterUpdate = await sut.findAll();
    expect(JSON.stringify(usersAfterUpdate)).toBe(JSON.stringify(usersBeforeUpdate));
});
*/


