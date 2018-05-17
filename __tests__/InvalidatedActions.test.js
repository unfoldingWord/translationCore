import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as InvalidatedActions from '../src/js/actions/InvalidatedActions';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('InvalidatedActions.set', () => {
  test('set Invalidated true', () => {
    const invalidated = true;
    const store = mockStore({
      projectDetailsReducer: {
        currentProjectToolsSelectedGL: {
          translationWords: 'en'
        }
      },
      toolsReducer: {
        currentToolName: 'translationWords'
      },
      groupsIndexReducer: {
        groupsIndex: [
          {
            id: 'apostle',
            name: 'apostle, apostles, apostleship'
          },
          {
            id: 'authority',
            name: 'authority, authorities'
          }
        ]
      },
      contextIdReducer: {
        contextId: {
          groupId: 'authority'
        }
      }
    });
    store.dispatch(InvalidatedActions.set('mannycolon', "2017-10-27T18:13:41.455Z", invalidated));
    const actions = store.getActions();
    expect(actions).toMatchSnapshot();
  });

  test('set Invalidated false', () => {
    const invalidated = false;
    const store = mockStore({
      projectDetailsReducer: {
        currentProjectToolsSelectedGL: {
          translationWords: 'en'
        }
      },
      toolsReducer: {
        currentToolName: 'translationWords'
      },
      groupsIndexReducer: {
        groupsIndex: [
          {
            id: 'apostle',
            name: 'apostle, apostles, apostleship'
          },
          {
            id: 'authority',
            name: 'authority, authorities'
          }
        ]
      },
      contextIdReducer: {
        contextId: {
          groupId: 'authority'
        }
      }
    });
    store.dispatch(InvalidatedActions.set('mannycolon', "2017-10-27T18:13:41.455Z", invalidated));
    const actions = store.getActions();
    expect(actions).toMatchSnapshot();
  });
});

describe('InvalidatedActions.setInvalidated', () => {
  test('set Invalidated true', () => {
    const invalidated = true;
    const store = mockStore({
      projectDetailsReducer: {
        currentProjectToolsSelectedGL: {
          translationWords: 'en'
        }
      },
      toolsReducer: {
        currentToolName: 'translationWords'
      },
      groupsIndexReducer: {
        groupsIndex: [
          {
            id: 'apostle',
            name: 'apostle, apostles, apostleship'
          },
          {
            id: 'authority',
            name: 'authority, authorities'
          }
        ]
      },
      contextIdReducer: {
        contextId: {
          groupId: 'authority'
        }
      }
    });
    store.dispatch(InvalidatedActions.setInvalidated('mannycolon', invalidated));
    const actions = store.getActions();
    expect(cleanOutDates(actions)).toMatchSnapshot();
  });

  test('set Invalidated false', () => {
    const invalidated = false;
     const store = mockStore({
      projectDetailsReducer: {
        currentProjectToolsSelectedGL: {
          translationWords: 'en'
        }
      },
      toolsReducer: {
        currentToolName: 'translationWords'
      },
      groupsIndexReducer: {
        groupsIndex: [
          {
            id: 'apostle',
            name: 'apostle, apostles, apostleship'
          },
          {
            id: 'authority',
            name: 'authority, authorities'
          }
        ]
      },
      contextIdReducer: {
        contextId: {
          groupId: 'authority'
        }
      }
    });
    store.dispatch(InvalidatedActions.setInvalidated('mannycolon', invalidated));
    const actions = store.getActions();
    expect(cleanOutDates(actions)).toMatchSnapshot();
  });
});

//
// helpers
//

function cleanOutDates(actions) {
  const cleanedActions = JSON.parse(JSON.stringify(actions));
  for (let action of cleanedActions) {
    if (action.modifiedTimestamp) {
      delete action.modifiedTimestamp;
    }
  }
  return cleanedActions;
}

