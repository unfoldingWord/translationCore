/* eslint-env jest */
/* eslint-disable no-console */
import fs from 'fs-extra';
import path from 'path-extra';
// helpers
import * as ProjectImportFilesystemHelpers from '../js/helpers/Import/ProjectImportFilesystemHelpers';
// constants
import { PROJECTS_PATH, IMPORTS_PATH } from '../js/common/constants';
jest.mock('fs-extra');
const projectName = 'aa_tit_text_ulb';
const fromPath = path.join(IMPORTS_PATH, projectName);
const toPath = path.join(PROJECTS_PATH, projectName);

const reimportCompoundMsg = 'projects.project_exists projects.reimporting_not_supported';
const noProjectInImportsFolderRejectMsg = {
  'data': {
    'fromPath': fromPath,
    'projectName': projectName,
  },
  'message': 'projects.not_found',
};

describe('ProjectImportFilesystemHelpers.move',()=> {
  beforeEach(()=>{
    fs.__resetMockFS();
  });

  test('ProjectImportFilesystemHelpers.move verifies that it does not reimport a project', () => {
    fs.__setMockFS({
      [toPath]: '',
      [fromPath]: '',
    });
    expect.assertions(1);
    return expect(ProjectImportFilesystemHelpers.moveProject(projectName, k=>k)).rejects.toEqual(reimportCompoundMsg);
  });

  test('ProjectImportFilesystemHelpers.move should fail/reject if the specified project is not found in the imports folder', () => {
    expect.assertions(1);
    return expect(ProjectImportFilesystemHelpers.moveProject(projectName, jest.fn())).rejects.toEqual(noProjectInImportsFolderRejectMsg);
  });

  test('ProjectImportFilesystemHelpers.move should move the file from imports folder to projects folder', () => {
    fs.__setMockFS({ [fromPath]: '' });
    expect(fs.existsSync(toPath)).toBeFalsy();
    expect(fs.existsSync(fromPath)).toBeTruthy();
    return expect(ProjectImportFilesystemHelpers.moveProject(projectName, jest.fn())).resolves.toBe(toPath);
  });
});

describe('ProjectImportFilesystemHelpers.projectExistsInProjectsFolder',()=> {
  beforeEach(()=>{
    fs.__resetMockFS();
  });

  const projectManifest = {
    'target_language': {
      'id': 'amo',
      'name': 'Amo',
    },
    'project': {
      'id': 'tit',
      'name': 'Titus',
    },
  };
  const uniqueManifest = {
    'target_language': {
      'id': 'hi',
      'name': 'Hindi',
    },
    'project': {
      'id': 'tit',
      'name': 'Titus',
    },
  };

  test('should verify that the given project exists in the projects folder', () => {
    fs.__setMockFS({
      [PROJECTS_PATH]:[projectName],
      [fromPath]:[],
      [toPath]:[],
      [path.join(toPath, 'manifest.json')]: projectManifest,
      [path.join(fromPath, 'manifest.json')]: projectManifest,
    });
    expect(ProjectImportFilesystemHelpers.projectExistsInProjectsFolder(fromPath)).toEqual(true);
  });

  test('should verify that the given project does not exist in the projects folder', () => {
    fs.__setMockFS({
      [PROJECTS_PATH]:[projectName],
      [path.join(toPath, 'manifest.json')]: projectManifest,
      [path.join(fromPath, 'manifest.json')]: uniqueManifest,
    });
    expect(ProjectImportFilesystemHelpers.projectExistsInProjectsFolder(fromPath)).toEqual(false);
  });
});

describe('areStringsEqualCaseInsensitive()', () => {
  test('expect "HI" == "HI"', () => {
    // given
    const expectedResult = true;

    // when
    const results = ProjectImportFilesystemHelpers.areStringsEqualCaseInsensitive('HI', 'HI');

    // then
    expect(results).toEqual(expectedResult);
  });

  test('expect "hI" == "Hi"', () => {
    // given
    const expectedResult = true;

    // when
    const results = ProjectImportFilesystemHelpers.areStringsEqualCaseInsensitive('hI', 'Hi');

    // then
    expect(results).toEqual(expectedResult);
  });

  test('expect "hi" == "hi"', () => {
    // given
    const expectedResult = true;

    // when
    const results = ProjectImportFilesystemHelpers.areStringsEqualCaseInsensitive('hi', 'hi');

    // then
    expect(results).toEqual(expectedResult);
  });

  test('expect "hi" == "HI"', () => {
    // given
    const expectedResult = true;

    // when
    const results = ProjectImportFilesystemHelpers.areStringsEqualCaseInsensitive('hi', 'HI');

    // then
    expect(results).toEqual(expectedResult);
  });

  test('expect "" != "HI"', () => {
    // given
    const expectedResult = false;

    // when
    const results = ProjectImportFilesystemHelpers.areStringsEqualCaseInsensitive('', 'HI');

    // then
    expect(results).toEqual(expectedResult);
  });

  test('expect null != "HI"', () => {
    // given
    const expectedResult = false;

    // when
    const results = ProjectImportFilesystemHelpers.areStringsEqualCaseInsensitive(null, 'HI');

    // then
    expect(results).toEqual(expectedResult);
  });

  test('expect "hi" != undefined', () => {
    // given
    const expectedResult = false;

    // when
    const results = ProjectImportFilesystemHelpers.areStringsEqualCaseInsensitive('hi', undefined);

    // then
    expect(results).toEqual(expectedResult);
  });

  test('expect "hi" != 5', () => {
    // given
    const expectedResult = false;

    // when
    const results = ProjectImportFilesystemHelpers.areStringsEqualCaseInsensitive('hi', 5);

    // then
    expect(results).toEqual(expectedResult);
  });
});

describe('ProjectDetailsActions.getProjectsByType()', () => {
  const projectsPath = path.join(PROJECTS_PATH);

  beforeEach(() => {
    // reset mock filesystem data
    fs.__resetMockFS();
    // Set up mock filesystem before each test
    fs.ensureDirSync(projectsPath);

    createMockProject(projectsPath, 'en_ult_eph_book', 'en', 'eph', 'ult');
  });

  test('finds project', () => {
    // given
    const expectedResults = ['en_ult_eph_book'];
    const langID = 'en';
    const bookID = 'eph';
    const resourceId = 'ult';

    // when
    const results = ProjectImportFilesystemHelpers.getProjectsByType(langID, bookID, resourceId);

    // then
    expect(results).toEqual(expectedResults);
  });

  test('finds project with upppercase', () => {
    // given
    const expectedResults = ['en_ult_eph_book'];
    const langID = 'EN';
    const bookID = 'EPH';
    const resourceId = 'ULT';

    // when
    const results = ProjectImportFilesystemHelpers.getProjectsByType(langID, bookID, resourceId);

    // then
    expect(results).toEqual(expectedResults);
  });

  test('does not find project with different resource', () => {
    // given
    const expectedResults = [ ];
    const langID = 'EN';
    const bookID = 'EPH';
    const resourceId = 'ULTT';

    // when
    const results = ProjectImportFilesystemHelpers.getProjectsByType(langID, bookID, resourceId);

    // then
    expect(results).toEqual(expectedResults);
  });
});

//
// helpers
//

function createMockProject(projectsPath, fileName, langID, bookID, resourceID) {
  fileName = fileName || (langID + '_' + resourceID + '_' + bookID + '_book');
  const projectFolderPath = path.join(projectsPath, fileName.toLowerCase());
  fs.ensureDirSync(projectFolderPath);
  const manifest = {
    target_language: { id: langID },
    project: { id: bookID },
    resource: { id: resourceID },
  };
  fs.outputJsonSync(path.join(projectFolderPath, 'manifest.json'), manifest);
}
