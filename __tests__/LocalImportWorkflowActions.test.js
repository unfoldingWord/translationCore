import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import consts from '../src/js/actions/ActionTypes';
import * as LocalImportWorkflowActions from '../src/js/actions/Import/LocalImportWorkflowActions';
import path from 'path';
import * as fs from "fs-extra";
require('jest');

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('LocalImportWorkflowActions', () => {
  let initialState = {};
  const importProjectName = 'en_tit_ulb';
  const importProjectPath = path.join(LocalImportWorkflowActions.IMPORTS_PATH, importProjectName);

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
      },
      localImportReducer: {
        selectedProjectFilename: importProjectName,
        sourceProjectPath: LocalImportWorkflowActions.IMPORTS_PATH
      }
    };
  });

  it('selectLocalProject() with a file selected, should call sendSync and localImport', () => {
    return new Promise((resolve, reject) => {
      // given
      const expectedActions= [
        {
          type: consts.SHOW_DIMMED_SCREEN,
          bool: true
        },
        {
          type: consts.TOGGLE_PROJECTS_FAB
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
          type: consts.UPDATE_SOURCE_PROJECT_PATH,
          sourceProjectPath: "./project/en_tit_ulb"
        },
        {
          type: consts.UPDATE_SELECTED_PROJECT_FILENAME,
          selectedProjectFilename: "en_tit_ulb"
        }
      ];
      const store = mockStore(initialState);
      const returnFilePath = [ "./project/en_tit_ulb" ];

      let validateCallback = () => { // validate when final function called

        // then
        verifyResults(store, expectedActions, mock_sendSync, expectedSendSyncCalls, expectedSendSyncParameters, resolve, reject);
      };

      const {mock_sendSync, mock_localImport_action} = setupLocalImportWorkflowActionsMocking(returnFilePath, validateCallback);
      const expectedSendSyncParameters = {
        properties: ['openFile'],
        filters: [
          { name: 'Supported File Types', extensions: ['usfm', 'sfm', 'txt', 'tstudio', 'tcore'] }
        ]
      };
      const expectedSendSyncCalls = 1;

      // when
      store.dispatch(LocalImportWorkflowActions.selectLocalProject(mock_sendSync, mock_localImport_action));
    });
  },5000);

  it('selectLocalProject() with no file selected, should call sendSync and show alert', () => {
    return new Promise((resolve, reject) => {
      // given
      const expectedActions= [
        {
          type: consts.SHOW_DIMMED_SCREEN,
          bool: true
        },
        {
          type: consts.TOGGLE_PROJECTS_FAB
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
          alertMessage: LocalImportWorkflowActions.ALERT_MESSAGE,
          loading: undefined,
          type: consts.OPEN_ALERT_DIALOG
        }
      ];
      const store = mockStore(initialState);
      const returnFilePath = [ ];
      const {mock_sendSync, mock_localImport_action} = setupLocalImportWorkflowActionsMocking(returnFilePath, resolve);
      const expectedSendSyncParameters = {
        properties: ['openFile'],
        filters: [
          { name: 'Supported File Types', extensions: ['usfm', 'sfm', 'txt', 'tstudio', 'tcore'] }
        ]
      };
      const expectedSendSyncCalls = 1;

      // when
      store.dispatch(LocalImportWorkflowActions.selectLocalProject(mock_sendSync, mock_localImport_action));

      // then
      let sendSyncCalled = false;
      waitForFinish(10,100,() => {
          // check if last function called
          sendSyncCalled = mock_sendSync.mock.instances.length > 0;
          return sendSyncCalled;
        },
        () => {
          verifyResults(store, expectedActions, mock_sendSync, expectedSendSyncCalls, expectedSendSyncParameters, resolve, reject);
        }
      );
    });
  },5000);

  it('localImport() on import error, should delete project', () => {
    return new Promise((resolve) => {
      // given
      // reset mock filesystem data
      fs.__resetMockFS();
      // Set up mocked out filePath and data in mock filesystem before each test
      fs.__setMockFS({
        [importProjectPath]: ['manifest.json'],
        [path.join(importProjectPath, 'manifest.json')]: {}
      });
      const store = mockStore(initialState);
      const getState = () => {
        return store.getState();
      };
      const dispatch = jest.fn();
      expect(fs.existsSync(importProjectPath)).toBeTruthy(); // path should be initialzed

      // when
      const localImport = LocalImportWorkflowActions.localImport();
      new Promise (async(resolve2) => {
        await localImport(dispatch, getState);
        resolve2();
      }).then(() => {

        // then
        expect(fs.existsSync(importProjectPath)).not.toBeTruthy(); // path should be deleted
        resolve();
      });


    });
  }, 5000);

  //
  // helpers
  //

  function waitForFinish(n,delay,finished,callback) {
    if(finished() || (n<=0)) {
      callback();
    }
    setTimeout(() => {
      waitForFinish(n-1,delay,finished,callback);
    }, delay);
  }

  function verifyResults(store, expectedActions, mock_sendSync, expectedSendSyncCalls, expectedSendSyncParameters, resolve, reject) {
    try {
      const actions = store.getActions();
      expect(actions).toEqual(expectedActions);
      const sendSyncCalls = mock_sendSync.mock;
      expect(sendSyncCalls.instances.length).toBe(expectedSendSyncCalls);
      const sendSyncCallingParameters = mock_sendSync.mock.calls[0];
      expect(sendSyncCallingParameters[1].options).toEqual(expectedSendSyncParameters);
      resolve();
    } catch(e){
      console.log("Exception thrown: " + e);
      reject();
    }
  }

  function setupLocalImportWorkflowActionsMocking(returnFilePath, callback) {
    const mock_sendSync = jest.fn((operation, config) => {
      return returnFilePath;
    });
    const mock_localImport_action = jest.fn(() => {
      callback();
    });
    return {mock_sendSync, mock_localImport_action};
  }
});
