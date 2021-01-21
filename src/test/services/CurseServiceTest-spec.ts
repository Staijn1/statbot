import {curseService} from "../../app/services/CurseService";


test("empty substring", function () {
    expect(curseService.occurrences("", "")).toEqual(1);
    expect(curseService.occurrences("abc", "")).toEqual(4);
});

test("single occurences", function () {
    expect(curseService.occurrences("foo", "foo")).toEqual(1);
    expect(curseService.occurrences("blahfooblah", "foo")).toEqual(1);
    expect(curseService.occurrences("foo", "f")).toEqual(1);
});

test("multiple occurrences", function () {
    expect(curseService.occurrences("foofoofoofoo", "foo")).toEqual(4);
    expect(curseService.occurrences("foofoofoofoo", "foofoo")).toEqual(2);
    expect(curseService.occurrences("blafooblahfooblah", "foo")).toEqual(2);
    expect(curseService.occurrences("foofoofooooofo", "foo")).toEqual(3);
    expect(curseService.occurrences("fuckfucking", "fuck")).toEqual(2);
});

test("no occurrences", function () {
    expect(curseService.occurrences("", "foo")).toEqual(0);
    expect(curseService.occurrences("abc", "foo")).toEqual(0);
    expect(curseService.occurrences("boo", "foo")).toEqual(0);
});

test("overlap", function () {
    expect(curseService.occurrences("", "", true)).toEqual(1);
    expect(curseService.occurrences("abc", "", true)).toEqual(4);
    expect(curseService.occurrences("foofoofoofoo", "foofoo", true)).toEqual(3)
    expect(curseService.occurrences("blafooblahfooblah", "foo", true)).toEqual(2);
    expect(curseService.occurrences("foofoofooooofo", "foo", true)).toEqual(3);
});

test("overlap no occurrences", function () {
    expect(curseService.occurrences("", "foo", true)).toEqual(0);
    expect(curseService.occurrences("abc", "foo", true)).toEqual(0);
    expect(curseService.occurrences("boo", "foo", true)).toEqual(0);
    expect(curseService.occurrences("fooofooofooofoo", "foofoo", true)).toEqual(0);
    expect(curseService.occurrences("blafobooblahfoboblah", "foo", true)).toEqual(0);
    expect(curseService.occurrences("fofofofaooooofo", "foo", true)).toEqual(0);
});

test("load words does not leave curseWords empty", function () {
    curseService.loadWords();
    expect(curseService.curseWords).toBeTruthy();
    expect(curseService.curseWords.length).not.toEqual(0);
});
