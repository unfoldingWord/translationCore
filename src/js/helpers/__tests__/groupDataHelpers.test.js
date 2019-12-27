import { isCheckUnique } from '../groupDataHelpers';

describe('Evaluate check uniqueness', () => {
  it('evaluates the first check', () => {
    const check = {
      contextId: {
        groupId: 'id',
        occurrence: 1,
        quote: 'quote',
      },
    };
    const checks = [];
    expect(isCheckUnique(check, checks)).toBe(true);
  });

  it('evaluates a revision of an already added check', () => {
    const check = {
      contextId: {
        groupId: 'id',
        occurrence: 1,
        quote: 'quote',
      },
    };
    const checks = [
      {
        contextId: {
          groupId: 'id',
          occurrence: 1,
          quote: 'quote',
        },
      },
    ];
    expect(isCheckUnique(check, checks)).toBe(false);
  });

  it('evaluates a different check', () => {
    const check = {
      contextId: {
        groupId: 'id',
        occurrence: 1,
        quote: 'quote',
      },
    };
    const checks = [
      {
        contextId: {
          groupId: 'hello',
          occurrence: 1,
          quote: 'world',
        },
      },
    ];
    expect(isCheckUnique(check, checks)).toBe(true);
  });

  it('evaluates a check with just a different quote id', () => {
    const check = {
      contextId: {
        groupId: 'id',
        occurrence: 1,
        quote: 'quote',
      },
    };
    const checks = [
      {
        contextId: {
          groupId: 'id',
          occurrence: 1,
          quote: 'different',
        },
      },
    ];
    expect(isCheckUnique(check, checks)).toBe(true);
  });

  it('evaluates a check with just a different group id', () => {
    const check = {
      contextId: {
        groupId: 'id',
        occurrence: 1,
        quote: 'quote',
      },
    };
    const checks = [
      {
        contextId: {
          groupId: 'different',
          occurrence: 1,
          quote: 'quote',
        },
      },
    ];
    expect(isCheckUnique(check, checks)).toBe(true);
  });

  it('\'evaluates a check with just a different occurrence id', () => {
    const check = {
      contextId: {
        groupId: 'id',
        occurrence: 1,
        quote: 'quote',
      },
    };
    const checks = [
      {
        contextId: {
          groupId: 'id',
          occurrence: 2,
          quote: 'quote',
        },
      },
    ];
    expect(isCheckUnique(check, checks)).toBe(true);
  });
});
