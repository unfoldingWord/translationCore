import {isNotRegistered} from '../src/js/helpers/FeedbackHelpers';

describe('indicates if the user has registered a feedback account', () => {

  test('empty', () => {
    const response = {};
    expect(isNotRegistered(response)).toEqual(false);
  });

  test('success', () => {
      const response = {
        status: 200,
        data: {}
      };
      expect(isNotRegistered(response)).toEqual(false);
  });

  test('error', () => {
    const response = {
      status: 401,
      data: {
        error: 'something broke'
      }
    };
    expect(isNotRegistered(response)).toEqual(false);
  });

  test('not registered', () => {
    const response = {
      status: 401,
      data: {
        error: 'User not registered: Insufficient access privileges'
      }
    };
    expect(isNotRegistered(response)).toEqual(true);
  });

  test('success but for some reason not registered', () => {
    // this would be silly, but just checking corner cases.
    const response = {
      status: 200,
      data: {
        error: 'User not registered: Insufficient access privileges'
      }
    };
    expect(isNotRegistered(response)).toEqual(false);
  });
});
