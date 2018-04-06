'use strict';

jest.mock('fs-extra');
import React from 'react';
import fs from 'fs-extra';
import path from 'path-extra';
import ospath from 'ospath';
import consts from '../src/js/actions/ActionTypes';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
// actions
import * as ProjectValidationActions from '../src/js/actions/Import/ProjectValidationActions';
// Mock store set up
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
// constants
const IMPORTS_PATH = path.join(ospath.home(), 'translationCore', 'imports');
const PROJECTS_PATH = path.join(ospath.home(), 'translationCore', 'projects');
const OLD_PROJECT_NAME_PATH_IN_IMPORTS = path.join(IMPORTS_PATH, 'SELECTED_PROJECT_NAME');
const OLD_PROJECT_NAME_PATH_IN_PROJECTS = path.join(PROJECTS_PATH, 'SELECTED_PROJECT_NAME');
const mockStoreData = {
  projectDetailsReducer: {
    manifest: {
      target_language: {
        id: 'fr',
        name: 'francais',
        direction: 'ltr'
      },
      project: {
        id: 'eph',
        name: 'Ephesians'
      },
      resource: {
        id: 'ult',
        name: 'unfoldingWord Literal Text'
      }
    }
  },
  localImportReducer: {
    selectedProjectFilename: 'SELECTED_PROJECT_NAME'
  }
};
const duplicateProjectPath = path.join(IMPORTS_PATH, 'fr_eph_ult');
const alertMessage = (
  <div>
    The project you selected ({duplicateProjectPath}) already exists.<br />
    Reimporting existing projects is not currently supported.
  </div>
);

describe('ProjectValidationActions.updateProjectFolderToNameSpecification', () => {
  beforeEach(() => {
    // reset mock filesystem data
    fs.__resetMockFS();
    // Set up mock filesystem before each test
    fs.__setMockFS({
      [OLD_PROJECT_NAME_PATH_IN_IMPORTS]: ''
    });
  });

  test('updateProjectFolderToNameSpecification dispatches correct actions if project is in tC imports folder', () => {
    const pathLocation = path.join(IMPORTS_PATH, 'fr_eph_ult');
    const expectedActions = [
      { type: consts.SET_SAVE_PATH_LOCATION, pathLocation },
      { type: consts.UPDATE_SELECTED_PROJECT_FILENAME, selectedProjectFilename: 'fr_eph_ult' },
      { "type": consts.OLD_SELECTED_PROJECT_FILENAME, "oldSelectedProjectFileName": "SELECTED_PROJECT_NAME" }
    ];
    const store = mockStore(mockStoreData);

    store.dispatch(ProjectValidationActions.updateProjectFolderToNameSpecification());
    expect(store.getActions()).toEqual(expectedActions);
  });

  test('updateProjectFolderToNameSpecification dispatches correct actions if project is in tC projects folder', () => {
    const selectedFileLocation = path.join(PROJECTS_PATH, 'SELECTED_PROJECT_NAME');
    const pathLocation = path.join(PROJECTS_PATH, 'fr_eph_ult');
    const expectedActions = [
      { type: consts.SET_SAVE_PATH_LOCATION, pathLocation },
      { type: consts.UPDATE_SELECTED_PROJECT_FILENAME, selectedProjectFilename: 'fr_eph_ult' },
      { "type": consts.OLD_SELECTED_PROJECT_FILENAME, "oldSelectedProjectFileName": "SELECTED_PROJECT_NAME" }
    ];
    const store = mockStore(mockStoreData);

    store.dispatch(ProjectValidationActions.updateProjectFolderToNameSpecification(selectedFileLocation));
    expect(store.getActions()).toEqual(expectedActions);
  });

  test("updateProjectFolderToNameSpecification renames the project's name in tC imports folder", () => {
    const pathLocation = path.join(IMPORTS_PATH, 'fr_eph_ult');
    const store = mockStore(mockStoreData);

    store.dispatch(ProjectValidationActions.updateProjectFolderToNameSpecification(pathLocation));
    expect(fs.existsSync(pathLocation)).toBeTruthy();
    expect(fs.existsSync(OLD_PROJECT_NAME_PATH_IN_IMPORTS)).toBeFalsy();
  });

  test("updateProjectFolderToNameSpecification renames the project's name in tC projects folder", () => {
    fs.__setMockFS({
      [OLD_PROJECT_NAME_PATH_IN_PROJECTS]: ''
    });
    const pathLocation = path.join(PROJECTS_PATH, 'SELECTED_PROJECT_NAME');
    const expectedPathLocation = path.join(PROJECTS_PATH, 'fr_eph_ult');
    const store = mockStore(mockStoreData);

    store.dispatch(ProjectValidationActions.updateProjectFolderToNameSpecification(pathLocation));
    expect(fs.existsSync(expectedPathLocation)).toBeTruthy();
    expect(fs.existsSync(OLD_PROJECT_NAME_PATH_IN_PROJECTS)).toBeFalsy();
  });

  test("updateProjectFolderToNameSpecification returns duplicate project alert if a project with the same name is found", () => {
    const sourceProjectPath = path.join(IMPORTS_PATH, 'fr_eph_ult');
    fs.__setMockFS({
      [sourceProjectPath]: ''
    });
    const store = mockStore(mockStoreData);

    expect(store.dispatch(ProjectValidationActions.updateProjectFolderToNameSpecification()))
      .rejects.toEqual(alertMessage);
  });
});
