import fs from 'fs-extra';
import path from 'path-extra';
import _ from 'lodash';
import migrateSaveChangesInOldProjects from '../js/helpers/ProjectMigration/migrateSaveChangesInOldProjects';
import Repo from '../js/helpers/Repo';
import {
  APP_VERSION,
  tc_EDIT_VERSION_KEY,
} from '../js/common/constants';
import { getPreviousVersion } from './ProjectStructureValidationHelpers.test';
// constants
jest.mock('fs-extra');

// mock Repo
const mockSave = jest.fn();

jest.mock('../js/helpers/Repo', () =>
  // mocks Class initialization
  jest.fn().mockImplementation(() => ({ save: mockSave })),
);

const mockOpen = jest.fn((dir, user) => new Repo(dir, user));
Repo.open = mockOpen; // add static to class
const mockOpenSafe = jest.fn((dir, user) => new Repo(dir, user));
Repo.openSafe = mockOpenSafe; // add static to class

const projectPath = path.join('mock', 'path', 'to', 'project');
const directoryToManifest = path.join(projectPath, 'manifest.json');
const manifest_ = {
  'generator': {
    'name': 'ts-desktop',
    'build': '132',
  },
  'target_language': {
    'id': 'es-419',
    'name': 'Español Latin America',
    'direction': 'ltr',
  },
  'project': {
    'id': 'eph',
    'name': 'Ephesians',
  },
};

describe('Test ability to translate bookname into target language fom manifest given a project class',()=> {
  let manifest = '';
  const user = 'DUMMY';

  beforeEach(() => {
    fs.__resetMockFS();
    manifest = _.cloneDeep(manifest_);
  });

  afterEach(() => {
    mockOpen.mockClear();
    mockOpenSafe.mockClear();
    mockSave.mockClear();
  });

  test('Project has no manifest should migrate', async () => { // this is really no project
    // given
    const projectPath = '/dummy/path';
    const expectMigrate = true;

    // when
    const results = await migrateSaveChangesInOldProjects(projectPath, user);

    // then
    expect(results).toEqual(expectMigrate);
    expect(mockOpen).toHaveBeenCalledTimes(0);
    expect(mockOpenSafe).toHaveBeenCalledTimes(1);
    expect(mockSave).toHaveBeenCalledTimes(1);
  });

  test('Project with no edit version should migrate', async () => {
    // given
    const expectMigrate = true;
    fs.outputJsonSync(directoryToManifest, manifest);

    // when
    const results = await migrateSaveChangesInOldProjects(projectPath, user);

    // then
    expect(results).toEqual(expectMigrate);
    expect( mockOpen).toHaveBeenCalledTimes(0);
    expect(mockOpenSafe).toHaveBeenCalledTimes(1);
    expect( mockSave).toHaveBeenCalledTimes(1);
  });

  test('Project with same edit version should not migrate', async () => {
    // given
    const expectMigrate = false;
    manifest[tc_EDIT_VERSION_KEY] = APP_VERSION;
    fs.outputJsonSync(directoryToManifest, manifest);

    // when
    const results = await migrateSaveChangesInOldProjects(projectPath, user);

    // then
    expect(results).toEqual(expectMigrate);
    expect( mockOpen).toHaveBeenCalledTimes(0);
    expect(mockOpenSafe).toHaveBeenCalledTimes(0);
    expect( mockSave).toHaveBeenCalledTimes(0);
  });

  test('Project with different edit version should migrate', async () => {
    // given
    const expectMigrate = true;
    manifest[tc_EDIT_VERSION_KEY] = getPreviousVersion(APP_VERSION);
    fs.outputJsonSync(directoryToManifest, manifest);

    // when
    const results = await migrateSaveChangesInOldProjects(projectPath, user);

    // then
    expect(results).toEqual(expectMigrate); // NOTE: if tc_EDIT_VERSION_KEY is changed this will fail - set it back to original value
    expect( mockOpen).toHaveBeenCalledTimes(0);
    expect(mockOpenSafe).toHaveBeenCalledTimes(1);
    expect( mockSave).toHaveBeenCalledTimes(1);
  });
});
