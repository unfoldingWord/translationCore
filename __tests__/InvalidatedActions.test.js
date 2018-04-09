import consts from '../src/js/actions/ActionTypes';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as InvalidatedActions from '../src/js/actions/InvalidatedActions';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('InvalidatedActions.set', () => {
  test('set Invalidated true', () => {
    const invalidated = true;
    const expectedActions = [{
      type: consts.SET_INVALIDATED,
      modifiedTimestamp: "2017-10-27T18:13:41.455Z",
      userName: 'mannycolon',
      gatewayLanguageCode: 'en',
      gatewayLanguageQuote: 'authority, authorities',
      invalidated
    }];
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
    expect(actions).toEqual(expectedActions);
  });

  test('set Invalidated false', () => {
    const invalidated = false;
    const expectedActions = [{
      type: consts.SET_INVALIDATED,
      modifiedTimestamp: "2017-10-27T18:13:41.455Z",
      userName: 'mannycolon',
      gatewayLanguageCode: 'en',
      gatewayLanguageQuote: 'authority, authorities',
      invalidated
    }];
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
    expect(actions).toEqual(expectedActions);
  });
});

describe('InvalidatedActions.setInvalidated', () => {
  test('set Invalidated true', () => {
    const invalidated = true;
    const expectedActions = {
      type: consts.SET_INVALIDATION_IN_GROUPDATA,
      "contextId": {"groupId": "authority"},
      invalidated
    };
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
    expect(actions.length).toEqual(2);
    expect(actions[1]).toEqual(expectedActions);
  });

  test('set Invalidated false', () => {
    const invalidated = false;
    const expectedActions = {
      type: consts.SET_INVALIDATION_IN_GROUPDATA,
      "contextId": {"groupId": "authority"},
      invalidated
    };
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
    expect(actions.length).toEqual(2);
    expect(actions[1]).toEqual(expectedActions);
  });
});
