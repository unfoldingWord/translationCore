/* eslint-env jest */

import groupsDataReducer from '../src/js/reducers/groupsDataReducer';
import consts from '../src/js/actions/ActionTypes';

const initialState = {
  groupsData: {},
  loadedFromFileSystem: false
};

describe('groupsDataReducer', () => {
  test('should return the initial state', () => {
    expect(
      groupsDataReducer(undefined, {})
    ).toEqual(initialState);
  });

  test('should handle SET_INVALIDATION_IN_GROUPDATA', () => {
    const invalidated = true;
    const initialState = {
      groupsData: {
        authority: [{contextId: {groupId: "authority"}}]
      },
      loadedFromFileSystem: false
    };

    const expectedState = {
      groupsData: {
        authority: [{contextId: {
          groupId: "authority"
          },
          invalidated
        }]
      },
      loadedFromFileSystem: false
    };

    const newState = groupsDataReducer(initialState, {
      type: consts.SET_INVALIDATION_IN_GROUPDATA,
      boolean: true,
      contextId: {"groupId": "authority"}
    });
    expect(newState).toEqual(expectedState);
  });
});
