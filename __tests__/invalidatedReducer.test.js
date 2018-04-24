/* eslint-env jest */

import invalidatedReducer from '../src/js/reducers/invalidatedReducer';
import consts from '../src/js/actions/ActionTypes';

const initialState = {
  invalidated: false,
  userName: null,
  modifiedTimestamp: null,
  gatewayLanguageCode: null,
  gatewayLanguageQuote: null
};

describe('invalidatedReducer', () => {
  test('should return the initial state', () => {
    expect(
      invalidatedReducer(undefined, {})
    ).toEqual(initialState);
  });

  test('should handle SET_INVALIDATED', () => {
    const expectedState = {
      invalidated: true,
      userName: "dummy",
      modifiedTimestamp: "now",
      gatewayLanguageCode: "lang_code",
      gatewayLanguageQuote: "quote"
    };

    expect(
      invalidatedReducer(initialState, {
        type: consts.SET_INVALIDATED,
        invalidated: true,
        userName: "dummy",
        modifiedTimestamp: "now",
        gatewayLanguageCode: "lang_code",
        gatewayLanguageQuote: "quote"
      })
    ).toEqual(expectedState);
  });
});
