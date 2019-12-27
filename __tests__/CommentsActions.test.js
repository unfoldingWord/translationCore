import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import consts from '../src/js/actions/ActionTypes';
import * as actions from '../src/js/actions/CommentsActions';
import { TRANSLATION_WORDS } from '../src/js/common/constants';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('../src/js/helpers/gatewayLanguageHelpers', () => ({
  getGatewayLanguageCodeAndQuote: () => ({
    gatewayLanguageCode: 'en',
    gatewayLanguageQuote: 'authority',
  }),
}));

describe('CommentsActions.addComment', () => {
  test('Add Comment', () => {
    const expectedActions = [{
      type: consts.ADD_COMMENT,
      modifiedTimestamp: '2017-10-27T18:13:41.455Z',
      text: 'comment',
      userName: 'mannycolon',
      activeBook: 'tit',
      activeChapter: 1,
      activeVerse: 3,
      gatewayLanguageCode: 'en',
      gatewayLanguageQuote: 'authority',
    }];
    const store = mockStore({
      projectDetailsReducer: { manifest: { toolsSelectedGLs: { translationWords: 'en' } } },
      toolsReducer: { selectedTool: TRANSLATION_WORDS },
      groupsIndexReducer: {
        groupsIndex: [
          {
            id: 'apostle',
            name: 'apostle, apostles, apostleship',
          },
          {
            id: 'authority',
            name: 'authority, authorities',
          },
        ],
      },
      contextIdReducer: {
        contextId: {
          groupId: 'authority',
          reference: {
            bookId: 'tit',
            chapter: 1,
            verse: 3,
          },
        },
      },
    });
    store.dispatch(actions.comment('comment', 'mannycolon', '2017-10-27T18:13:41.455Z'));

    expect(store.getActions()).toEqual(expectedActions);
  });
});
