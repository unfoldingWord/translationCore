jest.unmock('fs-extra');
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as ImportOnlineActions from '../src/js/actions/ImportOnlineActions';
import { importOnlineProjectFromUrl } from '../src/js/helpers/LoadOnlineHelpers';
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
jest.mock('../src/js/helpers/LoadOnlineHelpers', () => ({ importOnlineProjectFromUrl: jest.fn() }));

describe('ImportOnlineActions.importOnlineProject', () => {
  let initialState = {};

  beforeEach(() => {
    initialState = {
      importOnlineReducer: {
        importLink: ' https://git.door43.org/royalsix/es-419_tit_text_ulb '
      },
      settingsReducer: {
        onlineMode: true
      }
    };
  });

  it('should import a project that has whitespace in string', () => {
    const store = mockStore(initialState);
    store.dispatch(ImportOnlineActions.importOnlineProject());
    expect(importOnlineProjectFromUrl.mock.calls.length).toBe(1);
    expect(importOnlineProjectFromUrl.mock.calls[0][0]).toBe('https://git.door43.org/royalsix/es-419_tit_text_ulb');
  });
});