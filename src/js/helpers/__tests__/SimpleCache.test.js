import SimpleCache, { INSTANCE_STORAGE } from '../SimpleCache';

describe('default storage', () => {
  it('uses instanceStorage by default', () => {
    const cache = new SimpleCache();
    expect(cache.type()).toEqual(INSTANCE_STORAGE);
  });
});

// NOTE: no need to test local and session storage since this is just a wrapper around those.

describe('instanceStorage', () => {
  let cache = null;

  beforeEach(() => {
    cache = new SimpleCache(INSTANCE_STORAGE);
  });

  it('sets a string value', () => {
    expect(() => {
      cache.set('key', 'value');
    }).not.toThrow();
  });

  it('sets an object value', () => {
    expect(() => {
      cache.set('key', { prop: 'value' });
    }).not.toThrow();
  });

  it('gets a missing value', () => {
    expect(cache.get('missing')).toEqual(undefined);
  });

  it('gets a string value', () => {
    const value = 'value';
    cache.set('key', value);
    expect(cache.get('key')).toEqual(value);
  });

  it('gets a number value', () => {
    const value = 12;
    cache.set('key', value);
    expect(cache.get('key')).toEqual(value);
  });

  it('gets an object value', () => {
    const value = { prop: 'value' };
    cache.set('key', value);
    expect(cache.get('key')).toEqual(value);
  });

  it('clears all values', () => {
    cache.set('key', 'value');
    cache.set('key2', 2);
    cache.clear();
    expect(cache.get('key')).toEqual(undefined);
    expect(cache.get('key2')).toEqual(undefined);
  });

  it('has zero length when empty', () => {
    expect(cache.length()).toEqual(0);
  });

  it('has length matching number of items', () => {
    cache.set('key', 'value');
    cache.set('key2', 2);
    expect(cache.length()).toEqual(2);
  });

  it('has undefined key at unknown position', () => {
    expect(cache.key(0)).toEqual(undefined);
  });

  it('has key at position', () => {
    cache.set('key', 'value');
    expect(cache.key(0)).toEqual('key');
  });

  it('removes a key', () => {
    cache.set('key', 'value');
    expect(cache.get('key')).toEqual('value');
    cache.remove('key');
    expect(cache.get('key')).toEqual(undefined);
  });
});
