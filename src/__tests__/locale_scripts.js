import { flattenKeys } from '../../scripts/locale/common';

describe('flatten keys', () => {
  it('flattens an empty object', () => {
    const obj = {};
    const result = flattenKeys(obj);
    expect(result).toEqual([]);
  });

  it('flattens one key', () => {
    const obj = { test: 'value' };
    const result = flattenKeys(obj);
    expect(result).toEqual(['test']);
  });

  it('flattens one key', () => {
    const obj = { hello: { world: 'value' } };
    const result = flattenKeys(obj);
    expect(result).toEqual(['hello.world']);
  });

  it('flattens a tree', () => {
    const obj = {
      hello: {
        world: 'value',
        dude: 'value',
      },
    };
    const result = flattenKeys(obj);
    expect(result).toEqual(['hello.world', 'hello.dude']);
  });

  it('flattens multiple trees', () => {
    const obj = {
      hello: {
        world: 'value',
        dude: 'value',
      },
      greetings: {
        hello: 'value',
        hi: 'value',
      },
    };
    const result = flattenKeys(obj);
    expect(result).toEqual(['hello.world', 'hello.dude', 'greetings.hello', 'greetings.hi']);
  });
});
