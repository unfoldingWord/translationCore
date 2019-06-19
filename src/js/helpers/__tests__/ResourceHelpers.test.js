import {generateChapterGroupData, generateChapterGroupIndex} from "../groupDataHelpers";
import path from 'path';
import fs from "fs-extra";
import {
  mockGetBookId,
  mockGetCategoriesDir,
  mockGetSelectedCategories,
  mockImportCategoryGroupData,
  mockSetCategoryLoaded
} from "../ProjectAPI";
import {mockGetLatestTranslationHelp} from "../ResourceAPI";
import {
  copyGroupDataToProject,
  getFilesInResourcePath,
  loadProjectGroupIndex,
  migrateOldCheckingResourceData
} from "../ResourcesHelpers";
import isEqual from "deep-equal";

jest.mock("../groupDataHelpers");
jest.mock("../ProjectAPI");
jest.mock("../ResourceAPI");
jest.mock("fs-extra");

const PROJECTS_PATH = path.join('user', 'translationCore', 'projects');

describe("copy group data", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("copies group data", () => {
    mockGetLatestTranslationHelp.mockReturnValue(path.join("", "help", "dir"));
    fs.readdirSync.mockReturnValueOnce(["names", "other"]);
    fs.lstatSync.mockReturnValue({
      isDirectory: () => true
    });
    fs.pathExistsSync.mockReturnValue(true);
    mockGetBookId.mockReturnValue("tit");
    fs.readdirSync.mockReturnValueOnce(["apostle.json", "authority.json"]);
    copyGroupDataToProject("lang", "tool", "project/");
    const groupPath =  path.join("", "help", "dir", "names", "groups", "tit");
    expect(mockImportCategoryGroupData).toBeCalledWith("tool", path.join(groupPath, "authority.json"));
    expect(mockImportCategoryGroupData).toBeCalledWith("tool", path.join(groupPath, "apostle.json"));
    expect(mockImportCategoryGroupData.mock.calls.length).toBe(2);
    expect(mockSetCategoryLoaded).toBeCalledWith("tool", "authority");
    expect(mockSetCategoryLoaded).toBeCalledWith("tool", "apostle");
    expect(mockSetCategoryLoaded.mock.calls.length).toBe(2);
    expect(generateChapterGroupData).not.toBeCalled();
  });

  it("has no group data", () => {
    mockGetLatestTranslationHelp.mockReturnValue("/help/dir");
    fs.readdirSync.mockReturnValueOnce([]);

    expect(() => copyGroupDataToProject("lang", "tool", "project/")).toThrow();
    expect(mockImportCategoryGroupData).not.toBeCalled(); // nothing to import
    expect(mockSetCategoryLoaded).not.toBeCalled();
    expect(generateChapterGroupData).not.toBeCalled();
  });

  it("is missing help dir", () => {
    mockGetLatestTranslationHelp.mockReturnValueOnce(null);
    mockGetCategoriesDir.mockReturnValueOnce('cat/dir');
    mockGetBookId.mockReturnValueOnce('book');
    generateChapterGroupData.mockReturnValueOnce([]);

    copyGroupDataToProject("lang", "tool", "project/");
    expect(mockImportCategoryGroupData).not.toBeCalled();
    expect(mockSetCategoryLoaded).not.toBeCalled();
    expect(generateChapterGroupData).toBeCalled();  // generate chapter groups
  });

});

describe("load group index", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("has an index", () => {
    const translate = jest.fn();
    const expectedResult = [{
      id: "hello",
      name: "World"
    }];

    global.console = {error: jest.fn(), warn: jest.fn()};
    mockGetLatestTranslationHelp.mockReturnValueOnce("/help/dir");
    mockGetSelectedCategories.mockReturnValueOnce(["hello"]);
    fs.lstatSync.mockReturnValue({
      isFile: () => true
    });
    fs.readJsonSync.mockReturnValueOnce([{id: "hello", name: "World"}]);
    const result = loadProjectGroupIndex("lang", "tool", "dir/", translate);

    expect(result).toEqual(expectedResult);
    expect(generateChapterGroupIndex).not.toBeCalled();
    expect(console.error).not.toBeCalled();
    expect(console.warn).not.toBeCalled();
  });

  it("has a corrupt index", () => {
    const translate = jest.fn();
    const expectedResult = [];

    global.console = {error: jest.fn(), warn: jest.fn()};
    mockGetLatestTranslationHelp.mockReturnValueOnce("/help/dir");
    mockGetSelectedCategories.mockReturnValueOnce(["category"]);
    fs.lstatSync.mockReturnValue({
      isFile: () => true
    });
    fs.readJsonSync.mockImplementation(() => {throw new Error()}); // index is corrupt

    expect(loadProjectGroupIndex("lang", "tool", "dir/", translate)).toEqual(expectedResult);
    expect(generateChapterGroupIndex).not.toBeCalled();
    expect(console.error).toBeCalled();
    expect(console.warn).not.toBeCalled();
  });

  it("is missing help dir", () => {
    const translate = jest.fn();
    const expectedResult = [];

    global.console = {error: jest.fn(), warn: jest.fn()};
    mockGetLatestTranslationHelp.mockReturnValueOnce(null);
    generateChapterGroupIndex.mockReturnValueOnce([]);

    expect(loadProjectGroupIndex("lang", "tool", "dir/", translate)).toEqual(expectedResult);
    expect(generateChapterGroupIndex.mock.calls.length).toBe(1); // chapter index is generated
    expect(console.error).not.toBeCalled();
    expect(console.warn).not.toBeCalled();
    expect(fs.readJsonSync).not.toBeCalled();
    expect(mockGetSelectedCategories).not.toBeCalled();
  });

  it("is missing category index", () => {
    const translate = jest.fn();
    const expectedResult = [];

    global.console = {error: jest.fn(), warn: jest.fn()};
    mockGetLatestTranslationHelp.mockReturnValueOnce("/help/dir");
    mockGetSelectedCategories.mockReturnValueOnce(["category"]);
    fs.lstatSync.mockReturnValue({
      isFile: () => false // category index does not exist
    });

    expect(loadProjectGroupIndex("lang", "tool", "dir/", translate)).toEqual(expectedResult);
    expect(generateChapterGroupIndex).not.toBeCalled();
    expect(fs.readJsonSync).not.toBeCalled();
    expect(console.error).not.toBeCalled();
    expect(console.warn).toBeCalled();
  });

  it("has no selected categories", () => {
    const translate = jest.fn();
    const expectedResult = [];

    global.console = {error: jest.fn(), warn: jest.fn()};
    mockGetLatestTranslationHelp.mockReturnValueOnce("/help/dir");
    mockGetSelectedCategories.mockReturnValueOnce([]); // empty selection

    expect(loadProjectGroupIndex("lang", "tool", "dir/", translate)).toEqual(expectedResult);
    expect(generateChapterGroupIndex).not.toBeCalled();
    expect(fs.readJsonSync).not.toBeCalled();
    expect(fs.lstatSync).not.toBeCalled();
    expect(console.error).not.toBeCalled();
    expect(console.warn).not.toBeCalled();
  });
});

describe("migrate resources", () => {
  const projectSourcePath = path.join('__tests__', 'fixtures', 'project', 'checkingResources');
  const expectedFileCount = 246;

  beforeEach(() => {
    jest.clearAllMocks();
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
      differences.push(destPath + " - missing");
      continue;
    }
    if (sourceDir !== destDir) {
      differences.push(destPath + " - is not " + (sourceDir ? "folder" : "file"));
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
        differences.push(destPath + " - is changed");
        continue;
      }
    }
  }
  for (let file of destFiles) {
    if(!sourceFiles.includes(file)) {
      const destPath = path.join(destFolder, file);
      differences.push(destPath + " - extra file");
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

