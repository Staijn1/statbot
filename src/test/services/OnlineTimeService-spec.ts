import {OnlineTimeServiceTest} from "../../app/services/OnlineTimeService";
import {UserPOJO} from "../../app/pojo/UserPOJO";


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

afterAll(() => {
    sut = undefined;
})
