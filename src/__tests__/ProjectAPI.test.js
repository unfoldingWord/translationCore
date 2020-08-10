/* eslint-env jest */
import fs from 'fs-extra';
import path from 'path-extra';
import _ from 'lodash';
import ProjectAPI from '../js/helpers/ProjectAPI';
// constants
import {
  PROJECTS_PATH, TRANSLATION_NOTES, USER_RESOURCES_PATH,
} from '../js/common/constants';

describe('importCategoryGroupData()', () => {
  const sourceResourcesPath = path.join('src/__tests__/fixtures/resources');
  const projectName = 'en_gal';
  const projectDir = path.join(PROJECTS_PATH, projectName);
  const bookId = 'gal';
  const tnIndexPath = path.join(projectDir, '.apps', 'translationCore', 'index', TRANSLATION_NOTES, bookId);
  const manifest = { 'project':{ 'id': bookId } };
  const galIndexPath = 'en/translationHelps/translationNotes/v15/culture/groups/gal';

  beforeAll(() => {
    jest.restoreAllMocks(); // remove all mocks
  });
  beforeEach(() => {
    jest.restoreAllMocks(); // remove all mocks
    // reset mock filesystem data
    fs.__resetMockFS();
    const copyResourceFiles = [galIndexPath];
    fs.__loadFilesIntoMockFs(copyResourceFiles, sourceResourcesPath, USER_RESOURCES_PATH);
    fs.outputJsonSync(path.join(projectDir, 'manifest.json'), manifest);
  });

  it('imports new group data', () => {
    // given
    const p = new ProjectAPI(projectDir);
    const toolName = TRANSLATION_NOTES;
    const groupId = 'figs-explicit';
    const groupFileName = groupId + '.json';
    const tnHelpsGroupDataPath = path.join(USER_RESOURCES_PATH, galIndexPath, groupFileName);
    const groupsDataLoaded = [];
    fs.outputJsonSync(path.join(projectDir, 'manifest.json'), manifest);

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
    const { preExistingGroupData, oldNote } = mockExistingGroupData(groupIdData, groupItemNumber, groupIdDataPath);

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
  preExistingGroupItem.selections = ['by hearing with faith'];
  fs.outputJsonSync(groupIdDataPath, preExistingGroupData);
  return { preExistingGroupData, oldNote };
}
