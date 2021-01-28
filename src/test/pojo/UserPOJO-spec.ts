import {UserPOJO} from "../../app/pojo/UserPOJO";

test('should create an object with valid date', () => {
    const filledObject = new UserPOJO('username', 'id', [{lastJoined: '', minutes: 0, isOnline: true}],0, 0, 0, [{date: '', count: 0}], 0, [{lastJoined: '', isInVc: false, minutes: 0}]);
    expect(filledObject.userid).toBe('id')
    expect(filledObject.username).toBe('username');
    expect(filledObject.totalMinutesOnlineAllTime).toBe(0);
    expect(filledObject.minutesOnlinePerDay).toBeTruthy();
    expect(filledObject.messagesSentAllTime).toEqual(0);
    expect(filledObject.inactiveWarnings).toEqual(0);
    expect(filledObject.vcMinutesAllTime).toEqual(0);
    expect(filledObject.vcCountPerDay).toBeTruthy();
});
