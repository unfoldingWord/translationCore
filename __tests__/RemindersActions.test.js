import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import consts from '../src/js/actions/ActionTypes';
import * as actions from '../src/js/actions/RemindersActions';
import { TRANSLATION_WORDS } from '../src/js/common/constants';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('../src/js/helpers/gatewayLanguageHelpers', () => ({
  getGatewayLanguageCodeAndQuote: () => ({
    gatewayLanguageCode: 'en',
    gatewayLanguageQuote: 'authority',
  }),
}));

describe('RemindersActions.toggleReminder', () => {
  test('Toggle reminder', () => {
    const expectedActions = [{
      type: consts.TOGGLE_REMINDER,
      modifiedTimestamp: '2017-10-27T18:13:41.455Z',
      userName: 'mannycolon',
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
      contextIdReducer: { contextId: { groupId: 'authority' } },
    });
    store.dispatch(actions.toggle('mannycolon', '2017-10-27T18:13:41.455Z'));

    expect(store.getActions()).toEqual(expectedActions);
  });
});
