import consts from '../src/js/actions/ActionTypes';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as actions from '../src/js/actions/CommentsActions';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('CommentsActions.addComment', () => {
  test('Add Comment', () => {
    const expectedActions = [{
      type: consts.ADD_COMMENT,
      modifiedTimestamp: "2017-10-27T18:13:41.455Z",
      text: 'comment',
      userName: 'mannycolon',
      gatewayLanguageCode: 'en',
      gatewayLanguageQuote: 'authority, authorities'
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
    store.dispatch(actions.comment('comment', 'mannycolon', "2017-10-27T18:13:41.455Z"));

    expect(store.getActions()).toEqual(expectedActions);
  });
});
