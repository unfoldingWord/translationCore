import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import consts from '../src/js/actions/ActionTypes';
import * as importOnline  from '../src/js/actions/ImportOnlineSearchActions';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('ConfirmOnlineActions.confirmOnlineAction', () => {
    test('loadOnline.openManifest should return an error if no link is specified', () => {
      expect(importOnline.confirmOnlineAction).not.isNotNull();
    });
});