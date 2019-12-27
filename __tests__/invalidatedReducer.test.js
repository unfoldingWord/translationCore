/* eslint-env jest */

import invalidatedReducer from '../src/js/reducers/invalidatedReducer';
import consts from '../src/js/actions/ActionTypes';

const initialState = {
  'gatewayLanguageCode': null,
  'gatewayLanguageQuote': null,
  'invalidated': false,
  'invalidatedAlignmentsTotal': null,
  'invalidatedChecksTotal': null,
  'modifiedTimestamp': null,
  'userName': null,
  'verseEditsTotal': null,
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
      userName: 'dummy',
      modifiedTimestamp: 'now',
      gatewayLanguageCode: 'lang_code',
      gatewayLanguageQuote: 'quote',
      invalidatedAlignmentsTotal: null,
      invalidatedChecksTotal: null,
      verseEditsTotal: null,
    };

    expect(
      invalidatedReducer(initialState, {
        type: consts.SET_INVALIDATED,
        invalidated: true,
        userName: 'dummy',
        modifiedTimestamp: 'now',
        gatewayLanguageCode: 'lang_code',
        gatewayLanguageQuote: 'quote',
      })
    ).toEqual(expectedState);
  });
});
