import {isCheckUnique} from "../groupDataHelpers";

describe('Evaluate check uniqueness', () => {
  it('evaluates the first check', () => {
    const check = {
      groupId: "id",
      quote: "quote"
    };
    const checks = [];
    expect(isCheckUnique(check, checks)).toBe(true);
  });

  it('evaluates a revision of an already added check', () => {
    const check = {
      groupId: "id",
      quote: "quote"
    };
    const checks = [
      {
        groupId: "id",
        quote: "quote"
      }
    ];
    expect(isCheckUnique(check, checks)).toBe(false);
  });

  it('evaluates a different check', () => {
    const check = {
      groupId: "id",
      quote: "quote"
    };
    const checks = [
      {
        groupId: "hello",
        quote: "world"
      }
    ];
    expect(isCheckUnique(check, checks)).toBe(true);
  });

  it('evaluates a check with just a different quote id', () => {
    const check = {
      groupId: "id",
      quote: "quote"
    };
    const checks = [
      {
        groupId: "id",
        quote: "different"
      }
    ];
    expect(isCheckUnique(check, checks)).toBe(true);
  });

  it('evaluates a check with just a different group id', () => {
    const check = {
      groupId: "id",
      quote: "quote"
    };
    const checks = [
      {
        groupId: "different",
        quote: "quote"
      }
    ];
    expect(isCheckUnique(check, checks)).toBe(true);
  });
});
