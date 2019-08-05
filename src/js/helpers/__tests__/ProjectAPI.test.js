/* eslint-env jest */
jest.mock('fs-extra');
import fs from 'fs-extra';
import path from "path-extra";
import _ from "lodash";
import ProjectAPI from "../ProjectAPI";
// constants
import {APP_VERSION, PROJECTS_PATH, TRANSLATION_NOTES, USER_RESOURCES_PATH} from '../../common/constants';

describe('ProjectAPI', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('provides paths', () => {
    const p = new ProjectAPI('/root');
    expect(p.path).toEqual('/root');
    expect(p.dataPath).toContain(path.join("root", ".apps", "translationCore"));
    fs.readFileSync.mockReturnValueOnce(`{"project":{"id":"book"}}`);
    expect(p.getCategoriesDir('tool')).toContain(path.join("root", ".apps", "translationCore", "index", "tool", "book"));
  });

  describe('get group data', () => {
    it('returns group data', () => {
      const p = new ProjectAPI('/root');

      fs.readFileSync.mockReturnValueOnce(`{"project":{"id":"book"}}`);
      fs.pathExistsSync.mockReturnValueOnce(true);
      fs.lstatSync.mockReturnValueOnce({
        isDirectory: () => true
      });
      fs.readdirSync.mockReturnValueOnce(["file1.json", "file2.json", "something.else"]);
      fs.readJsonSync.mockReturnValueOnce([{hello: "world1"}]);
      fs.readJsonSync.mockReturnValueOnce([{hello: "world2"}]);

      expect(p.getGroupsData('tool')).toEqual({
        file1: [
          {
            hello: "world1"
          }
        ],
        file2: [
          {
            hello: "world2"
          }
        ]
      });
    });

    it('returns empty group data', () => {
      const p = new ProjectAPI('/root');

      fs.readFileSync.mockReturnValueOnce(`{"project":{"id":"book"}}`);
      fs.pathExistsSync.mockReturnValueOnce(true);
      fs.lstatSync.mockReturnValueOnce({
        isDirectory: () => false // groups data dir does not exist
      });
      fs.readdirSync.mockReturnValueOnce(["file1.json", "file2.json", "something.else"]);
      fs.readJsonSync.mockReturnValueOnce({hello: "world1"});
      fs.readJsonSync.mockReturnValueOnce({hello: "world2"});

      expect(p.getGroupsData('tool')).toEqual({});
    });
  });

  describe('check if category is loaded', () => {
    it('is loaded', () => {
      const p = new ProjectAPI('/root');
      jest.spyOn(global.console, 'warn');
      fs.readFileSync.mockReturnValueOnce(`{"project":{"id":"book"}}`);
      fs.pathExistsSync.mockReturnValueOnce(true);
      fs.readJsonSync.mockReturnValueOnce({loaded: ["category"]});
      expect(p.isCategoryLoaded('tool', 'category')).toEqual(true);
      expect(fs.outputJsonSync).not.toBeCalled();
      expect(console.warn).not.toBeCalled();
    });

    it('is not loaded', () => {
      const p = new ProjectAPI('/root');
      jest.spyOn(global.console, 'warn');
      fs.readFileSync.mockReturnValueOnce(`{"project":{"id":"book"}}`);
      fs.pathExistsSync.mockReturnValueOnce(true);
      fs.readJsonSync.mockReturnValueOnce({loaded: []}); // category is not loaded
      expect(p.isCategoryLoaded('tool', 'category')).toEqual(false);
      expect(fs.outputJsonSync).not.toBeCalled();
      expect(console.warn).not.toBeCalled();
    });

    it('has not been initialized', () => {
      const p = new ProjectAPI('/root');
      jest.spyOn(global.console, 'warn');
      fs.readFileSync.mockReturnValueOnce(`{"project":{"id":"book"}}`);
      fs.pathExistsSync.mockReturnValueOnce(false); // meta data file does not exist
      expect(p.isCategoryLoaded('tool', 'category')).toEqual(false);
      expect(fs.outputJsonSync.mock.calls.length).toBe(1);
      expect(console.warn).not.toBeCalled();
    });

    it('is corrupt', () => {
      const p = new ProjectAPI('/root');
      global.console = {warn: jest.fn()};
      fs.readFileSync.mockReturnValueOnce(`{"project":{"id":"book"}}`);
      fs.pathExistsSync.mockReturnValueOnce(true);
      fs.readJsonSync.mockImplementation(() => {throw new Error()}); // category is not loaded
      expect(p.isCategoryLoaded('tool', 'category')).toEqual(false);
      expect(fs.outputJsonSync.mock.calls.length).toBe(1);
      expect(console.warn).toBeCalled();
    });
  });

  describe('set category loaded', () => {
    const manifest = { "modified":"2019-05-10T17:13:50.393Z","tc_version":APP_VERSION};

    beforeEach(() => {
      jest.resetAllMocks();
    });

    it('adds loaded', () => {
      const p = new ProjectAPI('/root');
      jest.spyOn(global.console, 'warn');
      fs.readFileSync.mockReturnValueOnce(`{"project":{"id":"book"}}`);
      fs.pathExistsSync.mockReturnValueOnce(true);
      fs.readJsonSync.mockReturnValueOnce({current: [], loaded: ["other"]}).mockReturnValueOnce(manifest);

      p.setCategoryLoaded('tool', 'category');
      expect(console.warn).not.toBeCalled();
      expect(fs.outputJsonSync).toBeCalledWith(
        path.join(path.sep, "root", ".apps", "translationCore", "index", "tool", "book", ".categories"),
        {"current": [], "loaded": ["other", "category"], timestamp: manifest.modified}, { "spaces": 2 });
    });

    it('removes loaded', () => {
      const p = new ProjectAPI('/root');
      jest.spyOn(global.console, 'warn');
      fs.readFileSync.mockReturnValueOnce(`{"project":{"id":"book"}}`);
      fs.pathExistsSync.mockReturnValueOnce(true);
      fs.readJsonSync.mockReturnValueOnce({current: [], loaded: ["category", "other"]}).mockReturnValueOnce(manifest);

      p.setCategoryLoaded('tool', 'category', false);
      expect(console.warn).not.toBeCalled();
      expect(fs.outputJsonSync).toBeCalledWith(
        path.join(path.sep, "root", ".apps", "translationCore", "index", "tool", "book", ".categories"),
        {"current": [], "loaded": ["other"], timestamp: manifest.modified}, { "spaces": 2 });
    });

    it('rebuilds missing file', () => {
      const p = new ProjectAPI('/root');
      jest.spyOn(global.console, 'warn');
      fs.readFileSync.mockReturnValueOnce(`{"project":{"id":"book"}}`);
      fs.pathExistsSync.mockReturnValueOnce(false); // metadata file is missing
      fs.readJsonSync.mockReturnValueOnce(manifest);

      p.setCategoryLoaded('tool', 'category');
      expect(console.warn).not.toBeCalled();
      expect(fs.outputJsonSync).toBeCalledWith(
        path.join(path.sep, "root", ".apps", "translationCore", "index", "tool", "book", ".categories"),
        {"current": [], "loaded": ["category"], timestamp: manifest.modified}, { "spaces": 2 });
    });

    it('rebuilds corrupt file', () => {
      const p = new ProjectAPI('/root');
      global.console = {warn: jest.fn()};
      fs.readFileSync.mockReturnValueOnce(`{"project":{"id":"book"}}`);
      fs.pathExistsSync.mockReturnValueOnce(true);
      fs.readJsonSync.mockImplementation(() => {
        fs.readJsonSync.mockRestore();
        fs.readJsonSync.mockReturnValueOnce(manifest); // set return
        throw new Error();
      });
      p.setCategoryLoaded('tool', 'category');

      expect(console.warn).toBeCalled();
      expect(fs.outputJsonSync).toBeCalledWith(
        path.join(path.sep, "root", ".apps", "translationCore", "index", "tool", "book", ".categories"),
        {"current": [], "loaded": ["category"], timestamp: manifest.modified}, { "spaces": 2 });
    });
  });

  describe('get selected categories', () => {
    it('has selected', () => {
      const p = new ProjectAPI('/root');

      jest.spyOn(global.console, 'warn');
      fs.readFileSync.mockReturnValueOnce(`{"project":{"id":"book"}}`);
      fs.pathExistsSync.mockReturnValueOnce(true);
      fs.readJsonSync.mockReturnValueOnce({current: ["category"]});

      expect(p.getSelectedCategories('tool')).toEqual(["category"]);
      expect(console.warn).not.toBeCalled();
    });

    it('with parent', () => {
      const p = new ProjectAPI('/root');
      jest.spyOn(global.console, 'warn');
      fs.readFileSync.mockReturnValue(`{"project":{"id":"book"}}`);
      fs.pathExistsSync.mockReturnValue(true);
      fs.readJsonSync.mockReturnValueOnce({current: ["category"]});
      fs.readdirSync.mockReturnValueOnce(['parent.json']);
      fs.readJsonSync.mockReturnValueOnce(["category", "category2"]);

      expect( p.getSelectedCategories('tool', true)).toMatchObject({parent:['category']});
      expect(console.warn).not.toBeCalled();
    });

    it('is missing file', () => {
      const p = new ProjectAPI('/root');

      jest.spyOn(global.console, 'warn');
      fs.readFileSync.mockReturnValueOnce(`{"project":{"id":"book"}}`);
      fs.pathExistsSync.mockReturnValueOnce(false);

      expect(p.getSelectedCategories('tool')).toEqual([]);
      expect(console.warn).not.toBeCalled();
    });

    it('has corrupt file', () => {
      const p = new ProjectAPI('/root');

      global.console = {warn: jest.fn()};
      fs.readFileSync.mockReturnValueOnce(`{"project":{"id":"book"}}`);
      fs.pathExistsSync.mockReturnValueOnce(true);
      fs.readJsonSync.mockImplementation(() => {throw new Error()});

      expect(p.getSelectedCategories('tool')).toEqual([]);
      expect(console.warn).toBeCalled();
    });
  });

  describe('set selected categories', () => {
    it('sets selected', () => {
      const p = new ProjectAPI('/root');

      jest.spyOn(global.console, 'warn');
      fs.readFileSync.mockReturnValueOnce(`{"project":{"id":"book"}}`);
      fs.pathExistsSync.mockReturnValueOnce(true);
      fs.readJsonSync.mockReturnValueOnce({current: ["other"], loaded: []});

      p.setSelectedCategories('tool', ["category"]);
      expect(fs.outputJsonSync).toBeCalledWith(
        path.join(path.sep, "root", ".apps", "translationCore", "index", "tool", "book", ".categories"),
        {"current": ["category"], "loaded": []},
        { "spaces": 2 }
      );
      expect(console.warn).not.toBeCalled();
    });

    it('is missing file', () => {
      const p = new ProjectAPI('/root');

      jest.spyOn(global.console, 'warn');
      fs.readFileSync.mockReturnValueOnce(`{"project":{"id":"book"}}`);
      fs.pathExistsSync.mockReturnValueOnce(false);

      p.setSelectedCategories('tool', ["category"]);
      expect(fs.outputJsonSync).toBeCalledWith(
        path.join(path.sep, "root", ".apps", "translationCore", "index", "tool", "book", ".categories"),
        {"current": ["category"], "loaded": [], timestamp: expect.any(String)},
        { "spaces": 2 }
      );
      expect(console.warn).not.toBeCalled();
    });

    it('has corrupt file', () => {
      const p = new ProjectAPI('/root');

      global.console = {warn: jest.fn()};
      fs.readFileSync.mockReturnValueOnce(`{"project":{"id":"book"}}`);
      fs.pathExistsSync.mockReturnValueOnce(true);
      fs.readJsonSync.mockImplementation(() => {throw new Error()});

      p.setSelectedCategories('tool', ["category"]);
      expect(fs.outputJsonSync).toBeCalledWith(
        path.join(path.sep, "root", ".apps", "translationCore", "index", "tool", "book", ".categories"),
        {"current": ["category"], "loaded": [], timestamp: expect.any(String)},
        { "spaces": 2 }
      );
      expect(console.warn).toBeCalled();
    });
  });

  describe('hasNewGroupsData()', () => {
    const manifest_ = { "modified":"2019-05-10T17:13:50.393Z","tc_version":APP_VERSION};
    const categories_ = {"current":["kt","names","other"],"loaded":["kt","names","other"],"timestamp":"2019-05-10T17:13:50.393Z"};

    beforeEach(() => {
      jest.resetAllMocks();
    });

    it('same date does not need updating', () => {
      // given
      const expectHasNewGroupsData = false;
      const p = new ProjectAPI('/root');
      p.getBookId = jest.fn(() => ('tit'));
      const manifest = { ...manifest_ };
      const categories = { ...categories_ };
      fs.pathExistsSync.mockReturnValueOnce(true);
      fs.readJsonSync.mockReturnValueOnce(categories).mockReturnValueOnce(manifest);

      // when
      const results = p.hasNewGroupsData('tool');

      // then
      expect(results).toEqual(expectHasNewGroupsData);
    });

    it('older categories timestamp needs updating', () => {
      // given
      const expectHasNewGroupsData = true;
      const p = new ProjectAPI('/root');
      p.getBookId = jest.fn(() => ('tit'));
      const manifest = { ...manifest_ };
      const categories = { ...categories_ };
      categories.timestamp = "2019-05-10T17:13:50.300Z";
      fs.pathExistsSync.mockReturnValueOnce(true);
      fs.readJsonSync.mockReturnValueOnce(categories).mockReturnValueOnce(manifest);

      // when
      const results = p.hasNewGroupsData('tool');

      // then
      expect(results).toEqual(expectHasNewGroupsData);
    });

    it('newer categories timestamp needs updating', () => {
      // given
      const expectHasNewGroupsData = true;
      const p = new ProjectAPI('/root');
      p.getBookId = jest.fn(() => ('tit'));
      const manifest = { ...manifest_ };
      const categories = { ...categories_ };
      categories.timestamp = "2019-05-10T17:13:50.400Z";
      fs.pathExistsSync.mockReturnValueOnce(true);
      fs.readJsonSync.mockReturnValueOnce(categories).mockReturnValueOnce(manifest);

      // when
      const results = p.hasNewGroupsData('tool');

      // then
      expect(results).toEqual(expectHasNewGroupsData);
    });

    it('missing categories timestamp needs updating', () => {
      // given
      const expectHasNewGroupsData = true;
      const p = new ProjectAPI('/root');
      p.getBookId = jest.fn(() => ('tit'));
      const manifest = { ...manifest_ };
      const categories = { ...categories_ };
      delete categories.timestamp;
      fs.pathExistsSync.mockReturnValueOnce(true);
      fs.readJsonSync.mockReturnValueOnce(categories).mockReturnValueOnce(manifest);

      // when
      const results = p.hasNewGroupsData('tool');

      // then
      expect(results).toEqual(expectHasNewGroupsData);
    });

    it('missing updater manifest modified time needs updating', () => {
      // given
      const expectHasNewGroupsData = true;
      const p = new ProjectAPI('/root');
      p.getBookId = jest.fn(() => ('tit'));
      const manifest = { ...manifest_ };
      delete manifest.modified;
      const categories = { ...categories_ };
      fs.pathExistsSync.mockReturnValueOnce(true);
      fs.readJsonSync.mockReturnValueOnce(categories).mockReturnValueOnce(manifest);

      // when
      const results = p.hasNewGroupsData('tool');

      // then
      expect(results).toEqual(expectHasNewGroupsData);
    });
    it('missing categories file needs updating', () => {
      // given
      const expectHasNewGroupsData = true;
      const p = new ProjectAPI('/root');
      p.getBookId = jest.fn(() => ('tit'));
      const manifest = { ...manifest_ };
      const categories = { ...categories_ };
      fs.pathExistsSync.mockReturnValueOnce(false);
      fs.readJsonSync.mockReturnValueOnce(categories).mockReturnValueOnce(manifest);

      // when
      const results = p.hasNewGroupsData('tool');

      // then
      expect(results).toEqual(expectHasNewGroupsData);
    });
  });

  describe('getParentCategory()', () => {
    it('parent category exists for groupId', () => {
      const p = new ProjectAPI('/root');
      p.getAllCategoryMapping = jest.fn(() => {
        return {'name1': ['groupId1', 'groupId2']};
      });
      const expectedParentCategory = "name1";
      const parentCategory = p.getParentCategory('tool', 'groupId2');
      expect(parentCategory).toEqual(expectedParentCategory);
      jest.resetAllMocks();
    });

    it('parent category does not exist for groupId', () => {
      const p = new ProjectAPI('/root');
      p.getAllCategoryMapping = jest.fn(() => {
        return {'name1': ['groupId1', 'groupId2']};
      });
      const parentCategory = p.getParentCategory('tool', 'groupId3');
      expect(parentCategory).toBeUndefined();
      jest.resetAllMocks();
    });
  });
});

describe('importCategoryGroupData()', () => {
  const sourceResourcesPath = path.join(__dirname, '../../../../__tests__/fixtures/resources');
  const projectName = 'en_gal';
  const projectDir = path.join(PROJECTS_PATH, projectName);
  const bookId = "gal";
  const tnIndexPath = path.join(projectDir, '.apps', 'translationCore', 'index', TRANSLATION_NOTES, bookId);
  const manifest = {"project":{"id": bookId}};
  const galIndexPath = 'en/translationHelps/translationNotes/v15/culture/groups/gal';
  beforeEach(() => {
    jest.restoreAllMocks(); // remove all mocks
    // reset mock filesystem data
    fs.__resetMockFS();
    const copyResourceFiles = [galIndexPath];
    fs.__loadFilesIntoMockFs(copyResourceFiles, sourceResourcesPath, USER_RESOURCES_PATH);
    fs.outputJsonSync(path.join(projectDir, "manifest.json"), manifest);
  });

  it('imports new group data', () => {
    // given
    const p = new ProjectAPI(projectDir);
    const toolName = TRANSLATION_NOTES;
    const groupId = 'figs-explicit';
    const groupFileName = groupId + '.json';
    const tnHelpsGroupDataPath = path.join(USER_RESOURCES_PATH, galIndexPath, groupFileName);
    const groupsDataLoaded = [];

    // when
    const results = p.importCategoryGroupData(toolName, tnHelpsGroupDataPath, groupsDataLoaded);

    // then
    expect(results).toBeTruthy();
    const projectGroupIdPath = path.join(tnIndexPath, groupFileName);
    expect(fs.existsSync(projectGroupIdPath)).toBeTruthy();
    const tnHelpsGroupData = fs.readJsonSync(tnHelpsGroupDataPath);
    const projectGroupData = fs.readJsonSync(projectGroupIdPath);
    expect(projectGroupData).toEqual(tnHelpsGroupData);
  });

  it('updates new group contextId without overwriting existing data', () => {
    // given
    const p = new ProjectAPI(projectDir);
    const toolName = TRANSLATION_NOTES;
    const groupId = 'figs-explicit';
    const groupFileName = groupId + '.json';
    const tnHelpsGroupDataPath = path.join(USER_RESOURCES_PATH, galIndexPath, groupFileName);
    const groupsDataLoaded = [];
    const groupIdDataPath = path.join(tnIndexPath, groupId + '.json');
    const groupIdData = fs.readJsonSync(tnHelpsGroupDataPath);
    const groupItemNumber = 4;
    const {preExistingGroupData, oldNote} = mockExistingGroupData(groupIdData, groupItemNumber, groupIdDataPath);

    // when
    const results = p.importCategoryGroupData(toolName, tnHelpsGroupDataPath, groupsDataLoaded);

    // then
    expect(results).toBeTruthy();
    const projectGroupIdPath = path.join(tnIndexPath, groupFileName);
    expect(fs.existsSync(projectGroupIdPath)).toBeTruthy();
    const projectGroupData = fs.readJsonSync(projectGroupIdPath);
    verifyArraysMatchExceptItem(projectGroupData, preExistingGroupData, groupItemNumber);
    const shouldMatch = _.cloneDeep(preExistingGroupData[groupItemNumber]);
    shouldMatch.contextId.occurrenceNote = oldNote;
    expect(projectGroupData[groupItemNumber]).toEqual(shouldMatch); // data should be preserved but contextId is updated
  });

  it('skips importing existing group data', () => {
    // given
    const p = new ProjectAPI(projectDir);
    const toolName = TRANSLATION_NOTES;
    const groupId = 'figs-explicit';
    const groupFileName = groupId + '.json';
    const tnHelpsGroupDataPath = path.join(USER_RESOURCES_PATH, galIndexPath, groupFileName);
    const groupsDataLoaded = [groupId];

    // when
    p.importCategoryGroupData(toolName, tnHelpsGroupDataPath, groupsDataLoaded);

    // then
    const results = p.importCategoryGroupData(toolName, tnHelpsGroupDataPath, groupsDataLoaded);

    // then
    expect(results).toBeFalsy();
  });
});

//
// helpers
//

/**
 * match all items in array except for item at exceptItem
 * @param {Array} resultsArray
 * @param {Array} expectedArray
 * @param {Number} exceptItem
 */
function verifyArraysMatchExceptItem(resultsArray, expectedArray, exceptItem) {
  const compArray1 = _.cloneDeep(resultsArray);
  compArray1[exceptItem] = {};
  const compArray2 = _.cloneDeep(expectedArray);
  compArray2[exceptItem] = {};
  expect (compArray1).toEqual(compArray2);
}

/**
 * mock existing data by modifying groupIdData and saving to project index
 * @param groupIdData
 * @param groupItemNumber
 * @param groupIdDataPath
 * @return {{preExistingGroupData: *, oldNote: *}}
 */
function mockExistingGroupData(groupIdData, groupItemNumber, groupIdDataPath) {
  const preExistingGroupData = _.cloneDeep(groupIdData);
  const preExistingGroupItem = preExistingGroupData[groupItemNumber];
  const oldNote = preExistingGroupItem.contextId.occurrenceNote;
  preExistingGroupItem.contextId.occurrenceNote = 'old Note';
  preExistingGroupItem.invalidated = true;
  preExistingGroupItem.selections = ["by hearing with faith"];
  fs.outputJsonSync(groupIdDataPath, preExistingGroupData);
  return {preExistingGroupData, oldNote};
}
