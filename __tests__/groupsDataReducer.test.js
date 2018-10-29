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
    expect(newState).not.toEqual(initialState); // make sure we did not modify initial state
  });

  test('should handle SET_REMINDERS_IN_GROUPDATA', () => {
    const reminders = true;
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
          reminders
        }]
      },
      loadedFromFileSystem: false
    };

    const newState = groupsDataReducer(initialState, {
      type: consts.SET_REMINDERS_IN_GROUPDATA,
      boolean: true,
      contextId: {"groupId": "authority"}
    });
    expect(newState).toEqual(expectedState);
    expect(newState).not.toEqual(initialState); // make sure we did not modify initial state
  });

  test('should handle TOGGLE_SELECTIONS_IN_GROUPDATA', () => {
    const selections = [
      {
        "text": "authority ",
        "occurrence": 1,
        "occurrences": 1
      }
    ];
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
          selections
        }]
      },
      loadedFromFileSystem: false
    };

    const newState = groupsDataReducer(initialState, {
      type: consts.TOGGLE_SELECTIONS_IN_GROUPDATA,
      selections,
      contextId: {"groupId": "authority"}
    });
    expect(newState).toEqual(expectedState);
    expect(newState).not.toEqual(initialState); // make sure we did not modify initial state
  });

  test('should handle TOGGLE_VERSE_EDITS_IN_GROUPDATA', () => {
    const verseEdits = true;
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
          verseEdits
        }]
      },
      loadedFromFileSystem: false
    };

    const newState = groupsDataReducer(initialState, {
      type: consts.TOGGLE_VERSE_EDITS_IN_GROUPDATA,
      boolean: verseEdits,
      contextId: {"groupId": "authority"}
    });
    expect(newState).toEqual(expectedState);
    expect(newState).not.toEqual(initialState); // make sure we did not modify initial state
  });

  test('should handle TOGGLE_COMMENTS_IN_GROUPDATA', () => {
    const comments = ['stuff', 'more stuff'];
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
          comments: !!comments
        }]
      },
      loadedFromFileSystem: false
    };

    const newState = groupsDataReducer(initialState, {
      type: consts.TOGGLE_COMMENTS_IN_GROUPDATA,
      text: comments,
      contextId: {"groupId": "authority"}
    });
    expect(newState).toEqual(expectedState);
    expect(newState).not.toEqual(initialState); // make sure we did not modify initial state
  });
});
