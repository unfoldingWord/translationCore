jest.unmock('fs-extra');
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as OnlineImportWorkflowActions from '../src/js/actions/Import/OnlineImportWorkflowActions';
import { cloneRepo } from '../src/js/helpers/Import/OnlineImportWorkflowHelpers';
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
const STANDARD_PROJECT = 'https://git.door43.org/royalsix/es-419_tit_text_ulb.git';

jest.mock('../src/js/helpers/Import/OnlineImportWorkflowHelpers', () => ({ cloneRepo: jest.fn(() => {return new Promise((resolve)=>{return resolve()})})}));

describe('OnlineImportWorkflowActions.onlineImport', () => {
  let initialState = {};

  beforeEach(() => {
    initialState = {
      importOnlineReducer: {
        importLink: STANDARD_PROJECT
      },
      settingsReducer: {
        onlineMode: true
      }
    };
  });

  it('should import a project that has whitespace in string', () => {
    const store = mockStore(initialState);
    const expectedArg = STANDARD_PROJECT;
    store.dispatch(OnlineImportWorkflowActions.onlineImport());
    expect(cloneRepo.mock.calls.length).toBe(1);
    expect(cloneRepo.mock.calls[0][0]).toBe(expectedArg);
  });
});
