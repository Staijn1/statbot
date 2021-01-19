import {UserPOJO} from "../../app/pojo/UserPOJO";
import {DateTime} from "luxon";

test('should create an object with valid date', () => {
    const now = DateTime.local();
    const filledObject = new UserPOJO('username', 'id', 0, now.toString(), true, 0, 0, 0);
    expect(filledObject.userid).toBe('id')
    expect(filledObject.username).toBe('username');
    expect(filledObject.totalMinutesOnline).toBe(0);
    expect(filledObject.onlineSince.invalidReason).toBeFalsy()
    expect(filledObject.onlineSince.toISO()).toBe(now.toISO());
    expect(filledObject.isOnline).toBeTruthy();
    expect(filledObject.curseCount).toEqual(0);
    expect(filledObject.messagesSent).toEqual(0);
    expect(filledObject.inactiveWarnings).toEqual(0);
});
