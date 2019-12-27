/* eslint-env jest */

import groupsDataReducer from '../src/js/reducers/groupsDataReducer';
import consts from '../src/js/actions/ActionTypes';

const initialState = {
  groupsData: {},
  loadedFromFileSystem: false,
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
      groupsData: { authority: [{ contextId: { groupId: 'authority' } }] },
      loadedFromFileSystem: false,
    };

    const expectedState = {
      groupsData: {
        authority: [{
          contextId: { groupId: 'authority' },
          invalidated,
        }],
      },
      loadedFromFileSystem: false,
    };

    const newState = groupsDataReducer(initialState, {
      type: consts.SET_INVALIDATION_IN_GROUPDATA,
      boolean: true,
      contextId: { 'groupId': 'authority' },
    });
    expect(newState).toEqual(expectedState);
    expect(newState).not.toEqual(initialState); // make sure we did not modify initial state
  });

  test('should handle SET_REMINDERS_IN_GROUPDATA', () => {
    const reminders = true;
    const initialState = {
      groupsData: { authority: [{ contextId: { groupId: 'authority' } }] },
      loadedFromFileSystem: false,
    };

    const expectedState = {
      groupsData: {
        authority: [{
          contextId: { groupId: 'authority' },
          reminders,
        }],
      },
      loadedFromFileSystem: false,
    };

    const newState = groupsDataReducer(initialState, {
      type: consts.SET_REMINDERS_IN_GROUPDATA,
      boolean: true,
      contextId: { 'groupId': 'authority' },
    });
    expect(newState).toEqual(expectedState);
    expect(newState).not.toEqual(initialState); // make sure we did not modify initial state
  });

  it('clears the selection of the context', () => {
    const before = {
      groupsData: {
        authority: [
          {
            verseEdits: true,
            contextId: {
              groupId: 'authority',
              reference: {
                bookId: 'book', chapter: 1, verse: 1,
              },
            },
            nothingToSelect: false,
            selections: null,
          },
          {
            verseEdits: true,
            contextId: {
              groupId: 'authority',
              reference: {
                bookId: 'book', chapter: 1, verse: 2,
              },
            },
            selections: [{
              text: 'world',
              occurrence: 1,
              occurrences: 2,
            }],
          }],
      },
      loadedFromFileSystem: true,
    };

    const action = {
      type: consts.TOGGLE_SELECTIONS_IN_GROUPDATA,
      selections: [],
      contextId: {
        groupId: 'authority',
        reference: {
          bookId: 'book', chapter: 1, verse: 2,
        },
      },
    };

    const after = {
      groupsData: {
        authority: [
          {
            verseEdits: true,
            contextId: {
              groupId: 'authority',
              reference: {
                bookId: 'book', chapter: 1, verse: 1,
              },
            },
            nothingToSelect: false,
            selections: null,
          },
          {
            verseEdits: true,
            contextId: {
              groupId: 'authority',
              reference: {
                bookId: 'book', chapter: 1, verse: 2,
              },
            },
            nothingToSelect: false,
            selections: null,
          }],
      },
      loadedFromFileSystem: true,
    };

    const newState = groupsDataReducer(before, action);
    expect(newState).toEqual(after);
    expect(newState).not.toEqual(before); // make sure we did not modify initial state
  });

  test('should handle TOGGLE_SELECTIONS_IN_GROUPDATA', () => {
    const selections = [
      {
        'text': 'authority ',
        'occurrence': 1,
        'occurrences': 1,
      },
    ];
    const initialState = {
      groupsData: { authority: [{ contextId: { groupId: 'authority' } }] },
      loadedFromFileSystem: false,
    };

    const expectedState = {
      groupsData: {
        authority: [{
          contextId: { groupId: 'authority' },
          nothingToSelect: false,
          selections,
        }],
      },
      loadedFromFileSystem: false,
    };

    const newState = groupsDataReducer(initialState, {
      type: consts.TOGGLE_SELECTIONS_IN_GROUPDATA,
      selections,
      contextId: { 'groupId': 'authority' },
    });
    expect(newState).toEqual(expectedState);
    expect(newState).not.toEqual(initialState); // make sure we did not modify initial state
  });

  test('should handle TOGGLE_VERSE_EDITS_IN_GROUPDATA', () => {
    const verseEdits = true;
    const initialState = {
      groupsData: { authority: [{ contextId: { groupId: 'authority' } }] },
      loadedFromFileSystem: false,
    };

    const expectedState = {
      groupsData: {
        authority: [{
          contextId: { groupId: 'authority' },
          verseEdits,
        }],
      },
      loadedFromFileSystem: false,
    };

    const newState = groupsDataReducer(initialState, {
      type: consts.TOGGLE_VERSE_EDITS_IN_GROUPDATA,
      boolean: verseEdits,
      contextId: { 'groupId': 'authority' },
    });
    expect(newState).toEqual(expectedState);
    expect(newState).not.toEqual(initialState); // make sure we did not modify initial state
  });

  describe('TOGGLE_MULTIPLE_VERSE_EDITS_IN_GROUPDATA', () => {
    test('should handle single edit', () => {
      const verseEdits = true;
      const initialState = {
        groupsData: {
          authority: [{
            contextId: {
              groupId: 'authority',
              reference: {
                bookId: 'mat', chapter: '1', verse: '2',
              },
            },
          }],
        },
        loadedFromFileSystem: false,
      };

      const expectedState = {
        groupsData: {
          authority: [{
            contextId: {
              groupId: 'authority',
              reference: {
                bookId: 'mat', chapter: '1', verse: '2',
              },
            },
            verseEdits,
          }],
        },
        loadedFromFileSystem: false,
      };

      const newState = groupsDataReducer(initialState, {
        type: consts.TOGGLE_MULTIPLE_VERSE_EDITS_IN_GROUPDATA,
        groupId: 'authority',
        references: [{
          bookId: 'mat', chapter: '1', verse: '2',
        }],
      });
      expect(newState).toEqual(expectedState);
      expect(newState).not.toEqual(initialState); // make sure we did not modify initial state
    });

    test('should handle multiple occurrence edit', () => {
      const verseEdits = true;
      const initialState = {
        groupsData: {
          authority: [
            {
              contextId: {
                groupId: 'authority',
                reference: {
                  bookId: 'mat', chapter: '1', verse: '2',
                },
                occurrence: 1,
              },
            },
            {
              contextId: {
                groupId: 'authority',
                reference: {
                  bookId: 'mat', chapter: '1', verse: '2',
                },
                occurrence: 2,
              },
            }],
          god: [
            {
              contextId: {
                groupId: 'god',
                reference: {
                  bookId: 'mat', chapter: '1', verse: '1',
                },
                occurrence: 1,
              },
            },
            {
              contextId: {
                groupId: 'god',
                reference: {
                  bookId: 'mat', chapter: '1', verse: '2',
                },
                occurrence: 1,
              },
            }],
        },
        loadedFromFileSystem: false,
      };

      const expectedState = {
        groupsData: {
          authority: [
            {
              contextId: {
                groupId: 'authority',
                reference: {
                  bookId: 'mat', chapter: '1', verse: '2',
                },
                occurrence: 1,
              },
              verseEdits,
            },
            {
              contextId: {
                groupId: 'authority',
                reference: {
                  bookId: 'mat', chapter: '1', verse: '2',
                },
                occurrence: 2,
              },
              verseEdits,
            }],
          god: [
            {
              contextId: {
                groupId: 'god',
                reference: {
                  bookId: 'mat', chapter: '1', verse: '1',
                },
                occurrence: 1,
              },
            },
            {
              contextId: {
                groupId: 'god',
                reference: {
                  bookId: 'mat', chapter: '1', verse: '2',
                },
                occurrence: 1,
              },
            }],
        },
        loadedFromFileSystem: false,
      };

      const newState = groupsDataReducer(initialState, {
        type: consts.TOGGLE_MULTIPLE_VERSE_EDITS_IN_GROUPDATA,
        groupId: 'authority',
        references: [{
          bookId: 'mat', chapter: '1', verse: '2',
        }],
      });
      expect(newState).toEqual(expectedState);
      expect(newState).not.toEqual(initialState); // make sure we did not modify initial state
    });

    test('should handle single edit out of 2', () => {
      const verseEdits = true;
      const initialState = {
        groupsData: {
          authority: [
            {
              contextId: {
                groupId: 'authority',
                reference: {
                  bookId: 'mat', chapter: '1', verse: '2',
                },
                occurrence: 1,
              },
            },
            {
              contextId: {
                groupId: 'authority',
                reference: {
                  bookId: 'mat', chapter: '1', verse: '2',
                },
                occurrence: 2,
              },
            }],
          god: [
            {
              contextId: {
                groupId: 'god',
                reference: {
                  bookId: 'mat', chapter: '1', verse: '1',
                },
                occurrence: 1,
              },
            },
            {
              contextId: {
                groupId: 'god',
                reference: {
                  bookId: 'mat', chapter: '1', verse: '2',
                },
                occurrence: 1,
              },
            }],
        },
        loadedFromFileSystem: false,
      };

      const expectedState = {
        groupsData: {
          authority: [
            {
              contextId: {
                groupId: 'authority',
                reference: {
                  bookId: 'mat', chapter: '1', verse: '2',
                },
                occurrence: 1,
              },
            },
            {
              contextId: {
                groupId: 'authority',
                reference: {
                  bookId: 'mat', chapter: '1', verse: '2',
                },
                occurrence: 2,
              },
            }],
          god: [
            {
              contextId: {
                groupId: 'god',
                reference: {
                  bookId: 'mat', chapter: '1', verse: '1',
                },
                occurrence: 1,
              },
            },
            {
              contextId: {
                groupId: 'god',
                reference: {
                  bookId: 'mat', chapter: '1', verse: '2',
                },
                occurrence: 1,
              },
              verseEdits,
            }],
        },
        loadedFromFileSystem: false,
      };

      const newState = groupsDataReducer(initialState, {
        type: consts.TOGGLE_MULTIPLE_VERSE_EDITS_IN_GROUPDATA,
        groupId: 'god',
        references: [{
          bookId: 'mat', chapter: '1', verse: '2',
        }],
      });
      expect(newState).toEqual(expectedState);
      expect(newState).not.toEqual(initialState); // make sure we did not modify initial state
    });

    test('should handle multiple edits', () => {
      const verseEdits = true;
      const initialState = {
        groupsData: {
          authority: [
            {
              contextId: {
                groupId: 'authority',
                reference: {
                  bookId: 'mat', chapter: '1', verse: '2',
                },
                occurrence: 1,
              },
            },
            {
              contextId: {
                groupId: 'authority',
                reference: {
                  bookId: 'mat', chapter: '1', verse: '2',
                },
                occurrence: 2,
              },
            }],
          god: [
            {
              contextId: {
                groupId: 'god',
                reference: {
                  bookId: 'mat', chapter: '1', verse: '1',
                },
                occurrence: 1,
              },
            },
            {
              contextId: {
                groupId: 'god',
                reference: {
                  bookId: 'mat', chapter: '1', verse: '2',
                },
                occurrence: 1,
              },
            }],
        },
        loadedFromFileSystem: false,
      };

      const expectedState = {
        groupsData: {
          authority: [
            {
              contextId: {
                groupId: 'authority',
                reference: {
                  bookId: 'mat', chapter: '1', verse: '2',
                },
                occurrence: 1,
              },
            },
            {
              contextId: {
                groupId: 'authority',
                reference: {
                  bookId: 'mat', chapter: '1', verse: '2',
                },
                occurrence: 2,
              },
            }],
          god: [
            {
              contextId: {
                groupId: 'god',
                reference: {
                  bookId: 'mat', chapter: '1', verse: '1',
                },
                occurrence: 1,
              },
              verseEdits,
            },
            {
              contextId: {
                groupId: 'god',
                reference: {
                  bookId: 'mat', chapter: '1', verse: '2',
                },
                occurrence: 1,
              },
              verseEdits,
            }],
        },
        loadedFromFileSystem: false,
      };

      const newState = groupsDataReducer(initialState, {
        type: consts.TOGGLE_MULTIPLE_VERSE_EDITS_IN_GROUPDATA,
        groupId: 'god',
        references: [{
          bookId: 'mat', chapter: '1', verse: '2',
        },{
          bookId: 'mat', chapter: '1', verse: '1',
        }],
      });
      expect(newState).toEqual(expectedState);
      expect(newState).not.toEqual(initialState); // make sure we did not modify initial state
    });
  });

  test('should handle TOGGLE_COMMENTS_IN_GROUPDATA', () => {
    const comments = ['stuff', 'more stuff'];
    const initialState = {
      groupsData: { authority: [{ contextId: { groupId: 'authority' } }] },
      loadedFromFileSystem: false,
    };

    const expectedState = {
      groupsData: {
        authority: [{
          contextId: { groupId: 'authority' },
          comments: comments,
        }],
      },
      loadedFromFileSystem: false,
    };

    const newState = groupsDataReducer(initialState, {
      type: consts.TOGGLE_COMMENTS_IN_GROUPDATA,
      text: comments,
      contextId: { 'groupId': 'authority' },
    });
    expect(newState).toEqual(expectedState);
    expect(newState).not.toEqual(initialState); // make sure we did not modify initial state
  });
});
