import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import consts from '../src/js/actions/ActionTypes';
import * as ImportLocalActions from '../src/js/actions/ImportLocalActions';
require('jest');

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('ImportLocalActions.loadProjectFromFS', () => {
  let initialState = {};

  beforeEach(() => {
    initialState = {
      homeScreenReducer: {
        stepper: {
          stepIndex: 1,
          nextStepName: 'Project Information',
          previousStepName: 'Cancel',
          nextDisabled: false
        }
      },
      loginReducer: {
        loggedInUser: false,
        userdata: {},
        feedback: '',
        subject: 'Bug Report',
        placeholder: 'Leave us your feedback!'
      },
      projectDetailsReducer: {
        projectSaveLocation: '',
        manifest: {},
        currentProjectToolsProgress: {},
        projectType: null
      }
    };
  });

  it('with a file selected, should call showOpenDialog and verifyAndSelectProject', () => {
    return new Promise((resolve) => {
      // given
      const expectedActions= [
        {
          type: consts.TOGGLE_PROJECTS_FAB
        },
        {
          type: consts.SHOW_DIMMED_SCREEN,
          bool: true
        },
        {
          type: consts.SHOW_DIMMED_SCREEN,
          bool: false
        },
        {
          alertMessage: "Importing local project",
          loading: true,
          type: consts.OPEN_ALERT_DIALOG
        }
      ];
      const store = mockStore(initialState);
      const returnFilePath = [ "./project/en_tit_ulb" ];
      const {mock_showOpenDialog, mock_verifyAndSelectProject} = setupImportLocalActionsMocking(returnFilePath, resolve);
      const expectedshowOpenDialogParameters = {
        properties: ['openFile'],
        filters: [
          { name: 'Supported File Types', extensions: ['usfm', 'sfm', 'txt', 'tstudio'] }
        ]
      };
      const expectedShowOpenDialogCalls = 1;

      // when
      store.dispatch(ImportLocalActions.loadProjectFromFS(mock_showOpenDialog, mock_verifyAndSelectProject));

      // then
      verifyResults(store, expectedActions, mock_showOpenDialog, expectedShowOpenDialogCalls, expectedshowOpenDialogParameters);
    });
  });

  it('with no file selected, should call showOpenDialog and show alert', () => {
    return new Promise((resolve) => {
      // given
      const expectedActions= [
        {
          type: consts.TOGGLE_PROJECTS_FAB
        },
        {
          type: consts.SHOW_DIMMED_SCREEN,
          bool: true
        },
        {
          type: consts.SHOW_DIMMED_SCREEN,
          bool: false
        },
        {
          alertMessage: "Importing local project",
          loading: true,
          type: consts.OPEN_ALERT_DIALOG
        },
        {
          alertMessage: ImportLocalActions.ALERT_MESSAGE,
          loading: undefined,
          type: consts.OPEN_ALERT_DIALOG
        }
      ];
      const store = mockStore(initialState);
      const returnFilePath = [ ];
      const {mock_showOpenDialog, mock_verifyAndSelectProject} = setupImportLocalActionsMocking(returnFilePath, resolve);
      const expectedshowOpenDialogParameters = {
        properties: ['openFile'],
        filters: [
          { name: 'Supported File Types', extensions: ['usfm', 'sfm', 'txt', 'tstudio'] }
        ]
      };
      const expectedShowOpenDialogCalls = 1;

      // when
      store.dispatch(ImportLocalActions.loadProjectFromFS(mock_showOpenDialog, mock_verifyAndSelectProject));

      // then
      verifyResults(store, expectedActions, mock_showOpenDialog, expectedShowOpenDialogCalls, expectedshowOpenDialogParameters);
      resolve();
    });
  });

  //
  // helpers
  //

  function verifyResults(store, expectedActions, mock_showOpenDialog, expectedShowOpenDialogCalls, expectedshowOpenDialogParameters) {
    const actions = store.getActions();
    expect(actions).toEqual(expectedActions);
    const showOpenDialogCalls = mock_showOpenDialog.mock;
    expect(showOpenDialogCalls.instances.length).toBe(expectedShowOpenDialogCalls);
    const showOpenDialogCallingParameters = mock_showOpenDialog.mock.calls[0];
    expect(showOpenDialogCallingParameters[0]).toEqual(expectedshowOpenDialogParameters);
  }

  function setupImportLocalActionsMocking(returnFilePath, resolve) {
    const mock_showOpenDialog = jest.fn((config, callback) => {
      callback(returnFilePath);
    });
    const mock_verifyAndSelectProject = jest.fn(() => {
      resolve(); // test completed when this is called
    });
    return {mock_showOpenDialog, mock_verifyAndSelectProject};
  }
});
