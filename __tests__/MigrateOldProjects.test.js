jest.mock('fs-extra');
import fs from 'fs-extra';
import path from 'path-extra';
import _ from "lodash";
import migrateOldProjects from '../src/js/helpers/ProjectMigration/migrateOldProjects';
import Repo from '../src/js/helpers/Repo';

const mockSave = jest.fn();
jest.mock("../src/js/helpers/Repo", () => {
  // mocks Class initialization
  return jest.fn().mockImplementation(() => {
    return {save: mockSave};
  });
});
const mockOpen = jest.fn((dir, user) => {
  // return new Promise(resolve => {
  //   resolve(new Repo(dir, user));
  // });
  return new Repo(dir, user);
});
Repo.open = mockOpen; // add static to class

const projectPath = path.join('mock', 'path', 'to', 'project');
const directoryToManifest = path.join(projectPath, 'manifest.json');
const manifest_ = {
  "generator": {
    "name": "ts-desktop",
    "build": "132"
  },
  "target_language": {
    "id": "es-419",
    "name": "Español Latin America",
    "direction": "ltr"
  },
  "project": {
    "id": "eph",
    "name": "Ephesians"
  }
};

describe('Test ability to translate bookname into target language fom manifest given a project class',()=> {
  let manifest = "";
  const user = "DUMMY";

  beforeEach(() => {
    fs.__resetMockFS();
    manifest = _.cloneDeep(manifest_);
  });

  afterEach(() => {
      mockOpen.mockClear();
      mockSave.mockClear();
  });

  test('Project has no manifest should migrate', async () => {     // this is really no project
    // given
    const projectPath = "/dummy/path";
    const expectMigrate = true;

    // when
    const results = await migrateOldProjects(projectPath, user);

    // then
    expect(results).toEqual(expectMigrate);
    expect(mockOpen).toHaveBeenCalledTimes(1);
    expect(mockSave).toHaveBeenCalledTimes(1);
  });

  test('Project with no edit version should migrate', async () => {
    // given
    const expectMigrate = true;
    fs.outputJsonSync(directoryToManifest, manifest);

    // when
    const results = await migrateOldProjects(projectPath, user);

    // then
    expect(results).toEqual(expectMigrate);
    expect( mockOpen).toHaveBeenCalledTimes(1);
    expect( mockSave).toHaveBeenCalledTimes(1);
  });


  test('Project with same edit version should not migrate', async () => {
    // given
    const expectMigrate = false;
    manifest["tc_edit_version"] = "1.1.4";
    fs.outputJsonSync(directoryToManifest, manifest);

    // when
    const results = await migrateOldProjects(projectPath, user);

    // then
    expect(results).toEqual(expectMigrate);
    expect( mockOpen).toHaveBeenCalledTimes(0);
    expect( mockSave).toHaveBeenCalledTimes(0);
  });

});
