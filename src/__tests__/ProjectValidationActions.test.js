import fs from 'fs-extra';
import path from 'path-extra';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import consts from '../js/actions/ActionTypes';
// actions
import * as ProjectValidationActions from '../js/actions/Import/ProjectValidationActions';
// constants
import { PROJECTS_PATH, IMPORTS_PATH } from '../js/common/constants';
jest.mock('fs-extra');
// Mock store set up
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
const OLD_PROJECT_NAME_PATH_IN_IMPORTS = path.join(IMPORTS_PATH, 'SELECTED_PROJECT_NAME');
const OLD_PROJECT_NAME_PATH_IN_PROJECTS = path.join(PROJECTS_PATH, 'SELECTED_PROJECT_NAME');
const mockStoreData = {
  projectDetailsReducer: {
    manifest: {
      target_language: {
        id: 'fr',
        name: 'francais',
        direction: 'ltr',
      },
      project: {
        id: 'eph',
        name: 'Ephesians',
      },
      resource: {
        id: 'ult',
        name: 'unfoldingWord Literal Text',
      },
    },
  },
  localImportReducer: { selectedProjectFilename: 'SELECTED_PROJECT_NAME' },
  projectInformationCheckReducer: {},
};

describe('ProjectValidationActions.updateProjectFolderToNameSpecification', () => {
  beforeEach(() => {
    // reset mock filesystem data
    fs.__resetMockFS();
    // Set up mock filesystem before each test
    fs.__setMockFS({ [OLD_PROJECT_NAME_PATH_IN_IMPORTS]: '' });
  });

  test('updateProjectFolderToNameSpecification dispatches correct actions if project is in tC imports folder', async () => {
    const pathLocation = path.join(IMPORTS_PATH, 'fr_ult_eph_book');
    const expectedActions = [
      { type: consts.SET_SAVE_PATH_LOCATION, pathLocation },
      { type: consts.UPDATE_SELECTED_PROJECT_FILENAME, selectedProjectFilename: 'fr_ult_eph_book' },
      { 'type': consts.OLD_SELECTED_PROJECT_FILENAME, 'oldSelectedProjectFileName': 'SELECTED_PROJECT_NAME' },
    ];
    const store = mockStore(mockStoreData);

    await store.dispatch(ProjectValidationActions.updateProjectFolderToNameSpecification());
    expect(store.getActions()).toEqual(expectedActions);
  });

  test('updateProjectFolderToNameSpecification dispatches correct actions if project is in tC projects folder', async () => {
    const selectedFileLocation = path.join(PROJECTS_PATH, 'SELECTED_PROJECT_NAME');
    fs.ensureDirSync(selectedFileLocation);
    const pathLocation = path.join(PROJECTS_PATH, 'fr_ult_eph_book');
    const expectedActions = [
      { type: consts.SET_SAVE_PATH_LOCATION, pathLocation },
      { type: consts.UPDATE_SELECTED_PROJECT_FILENAME, selectedProjectFilename: 'fr_ult_eph_book' },
      { 'type': consts.OLD_SELECTED_PROJECT_FILENAME, 'oldSelectedProjectFileName': 'SELECTED_PROJECT_NAME' },
    ];
    const store = mockStore(mockStoreData);

    await store.dispatch(ProjectValidationActions.updateProjectFolderToNameSpecification(selectedFileLocation));
    expect(store.getActions()).toEqual(expectedActions);
  });

  test('updateProjectFolderToNameSpecification renames the project\'s name in tC imports folder', async () => {
    const pathLocation = path.join(IMPORTS_PATH, 'fr_eph_ult');
    const expectedLocation = path.join(IMPORTS_PATH, 'fr_ult_eph_book');
    const store = mockStore(mockStoreData);

    await store.dispatch(ProjectValidationActions.updateProjectFolderToNameSpecification(pathLocation));
    expect(fs.existsSync(expectedLocation)).toBeTruthy();
    expect(fs.existsSync(OLD_PROJECT_NAME_PATH_IN_IMPORTS)).toBeFalsy();
  });

  test('updateProjectFolderToNameSpecification renames the project\'s name in tC projects folder', async () => {
    fs.__setMockFS({ [OLD_PROJECT_NAME_PATH_IN_PROJECTS]: '' });

    const pathLocation = path.join(PROJECTS_PATH, 'SELECTED_PROJECT_NAME');
    const expectedPathLocation = path.join(PROJECTS_PATH, 'fr_ult_eph_book');
    const store = mockStore(mockStoreData);

    await store.dispatch(ProjectValidationActions.updateProjectFolderToNameSpecification(pathLocation));
    expect(fs.existsSync(expectedPathLocation)).toBeTruthy();
    expect(fs.existsSync(OLD_PROJECT_NAME_PATH_IN_PROJECTS)).toBeFalsy();
  });

  test('updateProjectFolderToNameSpecification returns duplicate project alert if a project with the same name is found', async () => {
    const sourceProjectPath = path.join(IMPORTS_PATH, 'fr_ult_eph_book');

    fs.__setMockFS({ [sourceProjectPath]: '' });

    const store = mockStore(mockStoreData);

    await expect(store.dispatch(ProjectValidationActions.updateProjectFolderToNameSpecification())).rejects.toMatchSnapshot();
  });
});
