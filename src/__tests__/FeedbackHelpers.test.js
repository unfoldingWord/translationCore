import { isNotRegistered, stringifySafe } from '../js/helpers/FeedbackHelpers';

describe('stringify json safely', () => {
  it('processes good json', () => {
    expect(stringifySafe({ hello:'world' }, '[error]')).toEqual('{"hello":"world"}');
  });

  it('processes circular json', () => {
    const child1 = {};
    const child2 = {};
    child2.child = child1;
    child1.child = child2;
    const circular = {
      children: [
        child1,
        child2,
      ],
    };
    expect(stringifySafe(circular, '[error]')).toEqual('{"children":[{"child":{"child":"[Circular ~.children.0]"}},{"child":{"child":"[Circular ~.children.1]"}}]}');
  });
});

describe('indicates if the user has registered a feedback account', () => {
  test('empty', () => {
    const response = {};
    expect(isNotRegistered(response)).toEqual(false);
  });

  test('success', () => {
    const response = {
      status: 200,
      data: {},
    };
    expect(isNotRegistered(response)).toEqual(false);
  });

  test('error', () => {
    const response = {
      status: 401,
      data: { error: 'something broke' },
    };
    expect(isNotRegistered(response)).toEqual(false);
  });

  test('not registered', () => {
    const response = {
      status: 401,
      data: { error: 'User not registered: Insufficient access privileges' },
    };
    expect(isNotRegistered(response)).toEqual(true);
  });

  test('success but for some reason not registered', () => {
    // this would be silly, but just checking corner cases.
    const response = {
      status: 200,
      data: { error: 'User not registered: Insufficient access privileges' },
    };
    expect(isNotRegistered(response)).toEqual(false);
  });
});
