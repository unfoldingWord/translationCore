/* eslint-env jest */
import path from 'path-extra';
import fs from 'fs-extra';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
//helpers
import * as USFMExportActions from '../js/actions/USFMExportActions';
import * as UsfmHelpers from '../js/helpers/usfmHelpers';
import * as Selectors from '../js/selectors';
// constants
import { PROJECTS_PATH, USER_RESOURCES_PATH } from '../js/common/constants';
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('../js/helpers/ProjectMigration', () => jest.fn());
jest.mock('../js/helpers/exportHelpers', () => ({
  ...require.requireActual('../js/helpers/exportHelpers'),
  getFilePath: (projectName, lastSaveLocation, ext) => `/${projectName}.${ext}`,
}));
jest.mock('../js/actions/MergeConflictActions', () => ({ validate: () => ({ type: 'VALIDATE' }) }));
jest.mock('../js/actions/WordAlignmentActions', () => ({ getUsfm3ExportFile: () => () => Promise.resolve('a usfm3 string') }));
jest.mock('../js/helpers/WordAlignmentHelpers', () => ({
  checkProjectForAlignments:  jest.fn(() => .1)
    .mockImplementationOnce(() => 0),
  getAlignmentPathsFromProject: jest.fn(() => ({
    wordAlignmentDataPath: true, projectTargetLanguagePath: true, chapters: true,
  }))
    .mockImplementationOnce(() => ({
      wordAlignmentDataPath: false, projectTargetLanguagePath: false, chapters: false,
    })),
}));
jest.mock('../js/actions/AlertModalActions', () => ({
  ...require.requireActual('../js/actions/AlertModalActions'),
  openOptionDialog: jest.fn((message, callback, button1, button2) =>
    (dispatch) => {
      //choose to export
      dispatch({ type: 'OPEN_OPTION_DIALOG' });
      callback(button2);
    })
    .mockImplementationOnce((message, callback, button1) =>
      (dispatch) => {
        //choose to export
        dispatch({ type: 'OPEN_OPTION_DIALOG' });
        callback(button1);
      })
    .mockImplementationOnce((message, callback, button1) =>
      (dispatch) => {
        //choose to export
        dispatch({ type: 'OPEN_OPTION_DIALOG' });
        callback(button1);
      })
    .mockImplementationOnce((message, callback, button1) =>
      (dispatch) => {
        //choose to export
        dispatch({ type: 'OPEN_OPTION_DIALOG' });
        callback(button1);
      })
    .mockImplementationOnce((message, callback, button1) =>
      (dispatch) => {
        //choose to export
        dispatch({ type: 'OPEN_OPTION_DIALOG' });
        callback(button1);
      }),
}));
jest.mock('usfm-js', () => ({ toUSFM: () => 'a usfm string' }));

jest.mock('../js/selectors', () => ({
  getActiveLocaleLanguage: () => ({ code: 'en' }),
  getTranslate: () => jest.fn((code) => code),
  getUsername: () => 'johndoe',
}));

describe('USFMExportActions', () => {
  const sourceProject = 'en_gal';
  const headers = [
    {
      'tag': 'id',
      'content': 'GAL N/A cdh_Chambeali_ltr Mon Sep 11 2017 16:44:56 GMT-0700 (PDT) tc',
    },
    {
      'tag': 'h',
      'content': 'Galatians',
    },
    {
      'tag': 'mt',
      'content': 'Galatians',
    },
    {
      'tag': 's5',
      'type': 'section',
    },
  ];

  beforeEach(() => {
    // reset mock filesystem data
    fs.__resetMockFS();
    fs.__setMockFS({}); // initialize to empty
    const sourcePath = path.join(__dirname, 'fixtures/project');
    let copyFiles = [sourceProject];
    fs.__loadFilesIntoMockFs(copyFiles, sourcePath, PROJECTS_PATH);
    const resourcePath = path.join(__dirname, 'fixtures/resources');
    copyFiles = ['en/bibles/ult'];
    fs.__loadFilesIntoMockFs(copyFiles, resourcePath, USER_RESOURCES_PATH);
  });
  afterEach(() => {
    // reset mock filesystem data
    fs.__resetMockFS();
  });

  test('should convert project with headers.json', () => {
    // given
    const projectFolder = path.join(PROJECTS_PATH, sourceProject);
    fs.outputJsonSync(path.join(projectFolder, 'gal', 'headers.json'), headers);

    // when
    const results = USFMExportActions.setUpUSFMJSONObject(projectFolder);

    // then
    expect(results).toBeTruthy();
    validateHeaderTagPresent(results.headers, 'id', true);
    validateHeaderTag(results.headers, headers, 'h');
    validateHeaderTag(results.headers, headers, 'mt');
    validateHeaderTag(results.headers, headers, 's5');
  });

  test('should convert project without headers.json', () => {
    // given
    const projectFolder = path.join(PROJECTS_PATH, sourceProject);

    // when
    const results = USFMExportActions.setUpUSFMJSONObject(projectFolder);

    // then
    expect(results).toBeTruthy();
    validateHeaderTagPresent(results.headers, 'id', true);
    validateHeaderTag(results.headers, headers, 'h');
    validateHeaderTagPresent(results.headers, 'mt', false);
    validateHeaderTagPresent(results.headers, 's5', false);
  });

  //
  // helpers
  //

  function validateHeaderTag(results_header_data, expected_header_data, tag) {
    const data = UsfmHelpers.getHeaderTag(results_header_data, tag);
    const expected_data = UsfmHelpers.getHeaderTag(expected_header_data, tag);
    expect(data).toEqual(expected_data);
  }

  function validateHeaderTagPresent(results_header_data, tag, present) {
    const data = UsfmHelpers.getHeaderTag(results_header_data, tag);

    if (present) {
      expect(data).toBeTruthy();
    } else {
      expect(data).not.toBeTruthy();
    }
  }
});

describe('USFMExportActions.USFMExportActions', () => {
  const projectSaveLocation = 'usfm/project/path';

  it('should check project for merge conflicts and reject', () => {
    const initialState = {
      localImportReducer: { selectedProjectFilename: 'path' },
      projectDetailsReducer: { projectSaveLocation },
      mergeConflictReducer: { conflicts: [true] },
    };
    const expectedActions = [{ 'type': 'VALIDATE' },
      { 'type': 'CLEAR_MERGE_CONFLICTS_REDUCER' },
      { 'type': 'RESET_PROJECT_VALIDATION_REDUCER' }];
    const store = mockStore(initialState);
    const currentLanguage = Selectors.getActiveLocaleLanguage(store.getState());
    const translationFn = Selectors.getTranslate();
    const testText = 'test';
    const translation = translationFn(testText);
    expect(currentLanguage.code).toEqual('en');
    expect(translation).toEqual(testText);

    return store.dispatch(USFMExportActions.checkProjectForMergeConflicts(projectSaveLocation)).catch((e) => {
      expect(e).toBe('projects.merge_export_error');
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('should check project for merge conflicts and resolve', () => {
    const initialState = {
      localImportReducer: { selectedProjectFilename: 'path' },
      projectDetailsReducer: { projectSaveLocation },
      mergeConflictReducer: { conflicts: null },
    };
    const expectedActions = [{ 'type': 'VALIDATE' }];
    const store = mockStore(initialState);
    return store.dispatch(USFMExportActions.checkProjectForMergeConflicts(projectSaveLocation)).then((res) => {
      expect(res).toBe();
      expect(store.getActions()).toEqual(expectedActions);
    });
  });
});

describe('USFMExportActions.displayUSFMExportFinishedDialog', () => {
  it('should call expected actions for showing alert dialog', () => {
    const expectedActions = [{
      type: 'OPEN_ALERT_DIALOG',
      alertMessage: 'projects.exported_alert',
      loading: false,
    }];
    const initialState = {};
    const store = mockStore(initialState);
    const projectName = 'a_project_name';
    store.dispatch(USFMExportActions.displayUSFMExportFinishedDialog(projectName));
    expect(store.getActions()).toEqual(expectedActions);
  });
});

describe('USFMExportActions.getExportType', () => {
  const projectSaveLocation = 'usfm/project/path';

  it('should default to usfm 2 if there is no alignment data', () => {
    const expectedActions = [];
    const initialState = {};
    const store = mockStore(initialState);
    return store.dispatch(USFMExportActions.getExportType(projectSaveLocation)).then((res) => {
      expect(res).toBe('usfm2');
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('should option open option dialog and user choose export type usfm3', () => {
    const usfmExportType = 'usfm3';
    const expectedActions = [{ 'type': 'OPEN_OPTION_DIALOG' }, { 'type': 'CLOSE_ALERT_DIALOG' }];
    const initialState = { settingsReducer: { currentSettings: { usfmExportType } } };
    const store = mockStore(initialState);
    return store.dispatch(USFMExportActions.getExportType(projectSaveLocation)).then((res) => {
      expect(res).toBe('usfm3');
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('should option open option dialog and user choose export type usfm2', () => {
    const usfmExportType = 'usfm2';
    const expectedActions = [{ 'type': 'OPEN_OPTION_DIALOG' }, { 'type': 'CLOSE_ALERT_DIALOG' }];
    const initialState = { settingsReducer: { currentSettings: { usfmExportType } } };
    const store = mockStore(initialState);
    return store.dispatch(USFMExportActions.getExportType(projectSaveLocation)).then((res) => {
      expect(res).toBe('usfm2');
      expect(store.getActions()).toEqual(expectedActions);
    });
  });


  it('should option open option dialog and user choose to cancel export', () => {
    const usfmExportType = 'usfm2';
    const expectedActions = [{ 'type': 'OPEN_OPTION_DIALOG' }, { 'type': 'CLOSE_ALERT_DIALOG' }];
    const initialState = { settingsReducer: { currentSettings: { usfmExportType } } };
    const store = mockStore(initialState);
    return store.dispatch(USFMExportActions.getExportType(projectSaveLocation)).catch((res) => {
      expect(res).toBe();
      expect(store.getActions()).toEqual(expectedActions);
    });
  });
});

describe('USFMExportActions.getUsfm2ExportFile', () => {
  const projectName = 'en_tit';

  beforeEach(() => {
    // reset mock filesystem data
    fs.__resetMockFS();
    fs.__setMockFS({}); // initialize to empty
    const sourcePath = path.join(__dirname, 'fixtures/project');
    let copyFiles = [projectName];
    fs.__loadFilesIntoMockFs(copyFiles, sourcePath, PROJECTS_PATH);
  });
  afterEach(() => {
    // reset mock filesystem data
    fs.__resetMockFS();
  });
  it('should get a usfm2 file from a valid project', () => {
    const projectSaveLocation = path.join(PROJECTS_PATH, projectName);
    expect(USFMExportActions.getUsfm2ExportFile(projectSaveLocation)).toBe('a usfm string');
  });
});

describe('USFMExportActions.setUpUSFMJSONObject', () => {
  const projectName = 'en_tit';

  beforeEach(() => {
    // reset mock filesystem data
    fs.__resetMockFS();
    fs.__setMockFS({}); // initialize to empty
    const sourcePath = path.join(__dirname, 'fixtures/project');
    let copyFiles = [projectName];
    fs.__loadFilesIntoMockFs(copyFiles, sourcePath, PROJECTS_PATH);
  });
  afterEach(() => {
    // reset mock filesystem data
    fs.__resetMockFS();
  });
  it('should get a verseObjects JSON from a valid project', () => {
    const expectedString = `Paul, a servant of God and an apostle of Jesus Christ, for the faith of God's chosen people and the knowledge of the truth that agrees with godliness,\n`;
    const projectSaveLocation = path.join(PROJECTS_PATH, projectName);
    const res = USFMExportActions.setUpUSFMJSONObject(projectSaveLocation);

    expect(res).toEqual(
      expect.objectContaining({
        chapters: expect.objectContaining({ '1': expect.any(Object) }),
        headers: expect.arrayContaining([
          expect.objectContaining({ content: expect.any(String) }),
          expect.objectContaining({ content: expect.any(String) }),
        ]),
      }),
    );
    expect(res).toHaveProperty('chapters.1.1.verseObjects.0.text', expectedString);
  });
});

describe('USFMExportActions.storeUSFMSaveLocation', () => {
  it('should store the users usfm save location selection', () => {
    const projectName = 'project_name';
    const filePath = 'user/saved/project/here/';
    const initialState = {};
    const expectedActions = [{ 'type': 'SET_USFM_SAVE_LOCATION', 'usfmSaveLocation': 'user/saved/project/here/' }];
    const store = mockStore(initialState);
    store.dispatch(USFMExportActions.storeUSFMSaveLocation(filePath, projectName));
    expect(store.getActions()).toEqual(expectedActions);
  });
});

describe('USFMExportActions.exportToUSFM', () => {
  const projectName = 'en_tit';

  beforeEach(() => {
    // reset mock filesystem data
    fs.__resetMockFS();
    fs.__setMockFS({}); // initialize to empty
    const sourcePath = path.join(__dirname, 'fixtures/project');
    let copyFiles = [projectName];
    fs.__loadFilesIntoMockFs(copyFiles, sourcePath, PROJECTS_PATH);
  });
  afterEach(() => {
    // reset mock filesystem data
    fs.__resetMockFS();
  });
  it('should get a successfully export a project to usfm3', () => {
    const filePath = `/57-TIT.usfm`;
    const expectedActions = [{ 'type': 'VALIDATE' },
      { 'type': 'OPEN_OPTION_DIALOG' },
      { 'type': 'CLOSE_ALERT_DIALOG' },
      {
        'alertMessage': 'projects.exporting_file_alert', 'loading': true, 'type': 'OPEN_ALERT_DIALOG',
      },
      { 'type': 'CLOSE_ALERT_DIALOG' },
      { 'bool': true, 'type': 'SHOW_DIMMED_SCREEN' },
      { 'bool': false, 'type': 'SHOW_DIMMED_SCREEN' },
      { 'type': 'SET_USFM_SAVE_LOCATION', 'usfmSaveLocation': '/' },
      {
        'alertMessage': 'projects.exported_alert', 'loading': false, 'type': 'OPEN_ALERT_DIALOG',
      },
      { 'bool': false, 'type': 'SHOW_DIMMED_SCREEN' }];
    const projectSaveLocation = path.join(PROJECTS_PATH, projectName);
    const usfmExportType = 'usfm3';
    const initialState = {
      localImportReducer: { selectedProjectFilename: projectName },
      projectDetailsReducer: { projectSaveLocation },
      mergeConflictReducer: { conflicts: null },
      settingsReducer: { currentSettings: { usfmExportType } },
    };
    const store = mockStore(initialState);
    return store.dispatch(USFMExportActions.exportToUSFM(projectSaveLocation)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
      expect(fs.readFileSync(filePath)).toBe('a usfm3 string');
    });
  });
});
