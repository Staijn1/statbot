import {OnlineTimeServiceTest} from "../../app/services/OnlineTimeService";
import {UserPOJO} from "../../app/pojo/UserPOJO";
import {Settings} from "luxon";


let sut = new OnlineTimeServiceTest('mocks/onlinetimeservice-spec.nedb');

beforeAll(() => {
  // Removing all documents with the 'match-all' query
  sut.remove({}, {multi: true});
  sut.insert(new UserPOJO(
    'testuser',
    '12345',
    [],
    0,
    0,
    0,
    [],
    0,
    []
  ))
});

test('should return undefined because user is not found', async () => {
  const result = await sut.findOne({userid: 'abc'});
  expect(result).toBeFalsy();
})

test('should return user because user is found', async () => {
  const result = await sut.findOne({userid: '12345'});
  expect(result).toBeTruthy();
  expect(result).toBeInstanceOf(UserPOJO)
})

test('findall should return array of userpojo ', async () => {
  const result = await sut.findAll();
  expect(result).toBeTruthy();
  expect(result.length).toBe(1)
})

test('update time at exactly midnight when user is still in voicechat', async () => {
  const user = new UserPOJO('testuser', '12345', [], 0, 0, 0, [], 0, [{
    lastJoined: '2021-02-02T23:58:00.000+01:00',
    minutes: 0,
    isInVc: true
  }])
  Settings.now = () => new Date(2021,1,3, 0).getTime()

  const updatespy = jest.spyOn(sut, 'update');
  sut.updateVoiceChatTime(user, false)

  expect(updatespy).toHaveBeenCalled();
  expect(user.vcCountPerDay[0].minutes).toEqual(2);
  expect(user.vcCountPerDay[0].isInVc).toEqual(false)
});

afterAll(() => {
  sut = undefined;
})
