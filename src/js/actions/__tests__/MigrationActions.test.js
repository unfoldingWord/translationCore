import path from 'path';
import fs from "fs-extra";
import isEqual from "deep-equal";
// helpers
import * as MigrationActions from "../MigrationActions";
// constants
import { PROJECTS_PATH, USER_RESOURCES_PATH, STATIC_RESOURCES_PATH } from '../../common/constants';

// constants
const mockConsole = console;
jest.mock('../../helpers/ResourcesHelpers', () => ({
  ...require.requireActual('../../helpers/ResourcesHelpers'),
  extractZippedResourceContent: (resourceDestinationPath, isBible) => {
    mockConsole.log(`mock extractZippedResourceContent: resourceDestinationPath=${resourceDestinationPath} isBible=${isBible}`);
  }
}));

describe("migrate tCore resources", () => {
  beforeEach(() => {
    fs.__resetMockFS();
    // simulate static resources path
    fs.__loadFilesIntoMockFs(['resources'], path.join('__tests__', 'fixtures'), path.join(STATIC_RESOURCES_PATH, ".."));
    fs.moveSync(path.join(STATIC_RESOURCES_PATH, "../resources"), STATIC_RESOURCES_PATH);
    // fs.__loadFilesIntoMockFs(['resources'], path.join('__tests__', 'fixtures'), path.join(USER_RESOURCES_PATH, ".."));
  });

  it("test with no user resources", () => {
    // given
    const migrateResourcesFolder = MigrationActions.migrateResourcesFolder();

    // when
    migrateResourcesFolder();

    // then
    const results = compareFolders(imagePath, projectDir);
    expect(results.count).toEqual(expectedFileCount);
    expect(results.differences.length).toEqual(expectedChangedFiles);
  });

});

describe("migrate project resources", () => {
  const projectSourcePath = path.join('__tests__', 'fixtures', 'project', 'checkingResources');
  const expectedFileCount = 246;

  beforeEach(() => {
    fs.__resetMockFS();
  });

  it("migrate tN resources - no changes", () => {
    // given
    const expectedChangedFiles = 0;
    const projectName = 'en_tit_checking';
    const toolName = 'translationNotes';
    fs.__loadFilesIntoMockFs([projectName], projectSourcePath, PROJECTS_PATH);
    const projectDir = path.join(PROJECTS_PATH, projectName);
    const imagePath = path.join(PROJECTS_PATH, projectName + ".image");
    fs.copySync(projectDir,imagePath); // back up originals

    // when
    migrateOldCheckingResourceData(projectDir, toolName);

    // then
    const results = compareFolders(imagePath, projectDir);
    expect(results.count).toEqual(expectedFileCount);
    expect(results.differences.length).toEqual(expectedChangedFiles);
  });

  it("migrate tN resources - resource changes", () => {
    // given
    const expectedChangedFiles = 3;
    const projectName = 'en_tit_checking';
    const toolName = 'translationNotes';
    fs.__loadFilesIntoMockFs([projectName], projectSourcePath, PROJECTS_PATH);
    const projectDir = path.join(PROJECTS_PATH, projectName);
    const toolsFolder = '.apps/translationCore';
    // update resource index
    fs.removeSync(path.join(projectDir, toolsFolder, 'index'));
    fs.__loadFilesIntoMockFs(['index'], path.join(projectSourcePath,'en_tit_new_resources'), path.join(projectDir, toolsFolder));
    const currentContextIdPath = path.join(projectName, toolsFolder, 'index', toolName,'tit/currentContextId/contextId.json');
    fs.__loadFilesIntoMockFs([currentContextIdPath], projectSourcePath, PROJECTS_PATH); // restore original contextId
    const imagePath = path.join(PROJECTS_PATH, projectName + ".image");
    fs.copySync(projectDir,imagePath); // back up originals

    // when
    migrateOldCheckingResourceData(projectDir, toolName);

    // then
    const results = compareFolders(imagePath, projectDir);
    expect(results.count).toEqual(expectedFileCount);
    expect(results.differences.length).toEqual(expectedChangedFiles);
    expect(results.differences).toMatchSnapshot();
    validateMigration(projectDir, toolsFolder, 'checkData/invalidated/tit/2/2/2019-04-24T16_01_01.823Z.json');
    validateMigration(projectDir, toolsFolder, 'checkData/selections/tit/2/2/2019-04-24T16_01_01.823Z.json');
    validateMigration(projectDir, toolsFolder, path.join('index', toolName, 'tit/currentContextId/contextId.json'), true);
  });

  it("migrate tW resources - resource changes", () => {
    // given
    const expectedChangedFiles = 3;
    const projectName = 'en_tit_checking';
    const toolName = 'translationWords';
    fs.__loadFilesIntoMockFs([projectName], projectSourcePath, PROJECTS_PATH);
    const projectDir = path.join(PROJECTS_PATH, projectName);
    const toolsFolder = '.apps/translationCore';
    // update resource index
    fs.removeSync(path.join(projectDir, toolsFolder, 'index'));
    fs.__loadFilesIntoMockFs(['index'], path.join(projectSourcePath,'en_tit_new_resources'), path.join(projectDir, toolsFolder));
    const currentContextIdPath = path.join(projectName, toolsFolder, 'index', toolName,'tit/currentContextId/contextId.json');
    fs.__loadFilesIntoMockFs([currentContextIdPath], projectSourcePath, PROJECTS_PATH); // restore original contextId
    const imagePath = path.join(PROJECTS_PATH, projectName + ".image");
    fs.copySync(projectDir,imagePath); // back up originals

    // when
    migrateOldCheckingResourceData(projectDir, toolName);

    // then
    const results = compareFolders(imagePath, projectDir);
    expect(results.count).toEqual(expectedFileCount);
    expect(results.differences.length).toEqual(expectedChangedFiles);
    expect(results.differences).toMatchSnapshot();
    validateMigration(projectDir, toolsFolder, 'checkData/invalidated/tit/1/4/2019-04-24T16_03_28.617Z.json');
    validateMigration(projectDir, toolsFolder, 'checkData/selections/tit/1/4/2019-04-24T16_03_28.617Z.json');
    validateMigration(projectDir, toolsFolder, path.join('index', toolName, 'tit/currentContextId/contextId.json'), true);
  });
});

//
// Helpers
//

/**
 * returns true if path is a directory
 * @param {String} path
 * @return {boolean}
 */
function isDirectory(path) {
  return fs.lstatSync(path).isDirectory();
}

function toLinuxPath(filePath) {
  const newPath = filePath.split(path.sep).join(path.posix.sep);
  return newPath;
}

/**
 * recursive directory compare
 * @param {String} srcFolder
 * @param {String} destFolder
 * @param {Array} differences - list of file paths that are different
 * @param {Number} count - number of files found
 * @return {{differences: Array, count: number}} return updated values
 */
function compareFolders(srcFolder, destFolder, differences = [], count = 0) {
  const sourceFiles = getFilesInResourcePath(srcFolder);
  const destFiles = getFilesInResourcePath(destFolder);
  count += destFiles.length;
  for (let file of sourceFiles) {
    const sourcePath = path.join(srcFolder, file);
    const sourceDir = isDirectory(sourcePath);
    const destPath = path.join(destFolder, file);
    const destDir = isDirectory(destPath);
    if (!fs.existsSync(destPath)) {
      differences.push(toLinuxPath(destPath) + " - missing");
      continue;
    }
    if (sourceDir !== destDir) {
      differences.push(toLinuxPath(destPath) + " - is not " + (sourceDir ? "folder" : "file"));
      continue;
    }
    if (sourceDir) {
      const results = compareFolders(sourcePath, destPath, differences, count);
      differences = results.differences;
      count = results.count;
      continue;
    } else { // files
      const srcData = fs.readFileSync(sourcePath);
      const destData = fs.readFileSync(destPath);
      if (!isEqual(srcData, destData)) {
        differences.push(toLinuxPath(destPath) + " - is changed");
        continue;
      }
    }
  }
  for (let file of destFiles) {
    if(!sourceFiles.includes(file)) {
      const destPath = path.join(destFolder, file);
      differences.push(toLinuxPath(destPath) + " - extra file");
    }
  }
  return {count, differences};
}

/**
 * makes sure file was migrated
 * @param projectDir
 * @param toolsFolder
 * @param checkPath
 * @param {boolean} isContext - if true then data is a contextId field
 */
function validateMigration(projectDir, toolsFolder, checkPath, isContext = false) {
  const filePath = path.join(projectDir, toolsFolder, checkPath);
  let data = fs.readJsonSync(filePath);
  if (isContext) {
    data = {contextId: data};
  }
  expect(Array.isArray(data.contextId.quote)).toBeTruthy();
}

