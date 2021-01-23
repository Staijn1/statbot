import {UserPOJO} from "../../app/pojo/UserPOJO";
import {DateTime} from "luxon";

test('should create an object with valid date', () => {
    const now = DateTime.local();
    const filledObject = new UserPOJO('username', 'id', 0, now.toString(), true, 0, 0, []);
    expect(filledObject.userid).toBe('id')
    expect(filledObject.username).toBe('username');
    expect(filledObject.totalMinutesOnline).toBe(0);
    expect(filledObject.isOnline).toBeTruthy();
    expect(filledObject.messagesSentAllTime).toEqual(0);
    expect(filledObject.inactiveWarnings).toEqual(0);
});
