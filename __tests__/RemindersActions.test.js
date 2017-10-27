import consts from '../src/js/actions/ActionTypes';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('RemindersActions.toggleReminder', () => {
  test('Toggle reminder', () => {
      const expectedAction = {
        type: consts.TOGGLE_REMINDER,
        modifiedTimestamp: "2017-10-27T18:13:41.455Z",
        userName: 'mannycolon'
      };
      const store = mockStore({
        enabled: false,
        userName: null,
        modifiedTimestamp: null
      });
      
      expect(store.dispatch({
        type: consts.TOGGLE_REMINDER,
        modifiedTimestamp: "2017-10-27T18:13:41.455Z",
        userName: 'mannycolon'
      })).toEqual(expectedAction);
  });
});