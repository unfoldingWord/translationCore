/* eslint-disable import/named */
import path from 'path';
import fs from 'fs-extra';
import {
  generateChapterGroupData,
  generateChapterGroupIndex,
} from '../groupDataHelpers';
import {
  mockSetCategoryLoaded,
  mockImportCategoryGroupData,
  mockGetCategoriesDir,
  mockGetBookId,
  mockGetSelectedCategories,
} from '../ProjectAPI';
import { mockGetLatestTranslationHelp } from '../ResourceAPI';

import { loadProjectGroupIndex, copyGroupDataToProject } from '../ResourcesHelpers';
jest.mock('../groupDataHelpers');
jest.mock('../ProjectAPI');
jest.mock('../ResourceAPI');
jest.mock('fs-extra');

describe('copy group data', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('copies group data', () => {
    mockGetLatestTranslationHelp.mockReturnValue(path.join('', 'help', 'dir'));
    fs.readdirSync.mockReturnValueOnce(['names', 'other']);
    fs.lstatSync.mockReturnValue({ isDirectory: () => true });
    fs.pathExistsSync.mockReturnValue(true);
    mockGetBookId.mockReturnValue('tit');
    fs.readdirSync.mockReturnValueOnce(['apostle.json', 'authority.json']);
    copyGroupDataToProject('lang', 'tool', 'project/');
    const groupPath = path.join('', 'help', 'dir', 'names', 'groups', 'tit');
    expect(mockImportCategoryGroupData).toBeCalledWith('tool', path.join(groupPath, 'authority.json'), 'mockCategories');
    expect(mockImportCategoryGroupData).toBeCalledWith('tool', path.join(groupPath, 'apostle.json'), 'mockCategories');
    expect(mockImportCategoryGroupData.mock.calls.length).toBe(2);
    expect(mockSetCategoryLoaded).toBeCalledWith('tool', 'authority');
    expect(mockSetCategoryLoaded).toBeCalledWith('tool', 'apostle');
    expect(mockSetCategoryLoaded.mock.calls.length).toBe(2);
    expect(generateChapterGroupData).not.toBeCalled();
  });

  it('has no group data', () => {
    mockGetLatestTranslationHelp.mockReturnValue('/help/dir');
    fs.readdirSync.mockReturnValueOnce([]);

    expect(() => copyGroupDataToProject('lang', 'tool', 'project/')).toThrow();
    expect(mockImportCategoryGroupData).not.toBeCalled(); // nothing to import
    expect(mockSetCategoryLoaded).not.toBeCalled();
    expect(generateChapterGroupData).not.toBeCalled();
  });

  it('is missing help dir', () => {
    mockGetLatestTranslationHelp.mockReturnValueOnce(null);
    mockGetCategoriesDir.mockReturnValueOnce('cat/dir');
    mockGetBookId.mockReturnValueOnce('book');
    generateChapterGroupData.mockReturnValueOnce([]);

    copyGroupDataToProject('lang', 'tool', 'project/');
    expect(mockImportCategoryGroupData).not.toBeCalled();
    expect(mockSetCategoryLoaded).not.toBeCalled();
    expect(generateChapterGroupData).toBeCalled(); // generate chapter groups
  });
});

describe('load group index', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('has an index', () => {
    const translate = jest.fn();
    const expectedResult = [{
      id: 'hello',
      name: 'World',
    }];

    global.console = { error: jest.fn(), warn: jest.fn() };
    mockGetLatestTranslationHelp.mockReturnValueOnce('/help/dir');
    mockGetSelectedCategories.mockReturnValueOnce(['hello']);
    fs.existsSync.mockReturnValue(true);
    fs.readJsonSync.mockReturnValueOnce([{ id: 'hello', name: 'World' }]);
    const result = loadProjectGroupIndex('lang', 'tool', 'dir/', translate);

    expect(result).toEqual(expectedResult);
    expect(generateChapterGroupIndex).not.toBeCalled();
    expect(console.error).not.toBeCalled();
    expect(console.warn).not.toBeCalled();
  });

  it('has a corrupt index', () => {
    const translate = jest.fn();
    const expectedResult = [];

    global.console = { error: jest.fn(), warn: jest.fn() };
    mockGetLatestTranslationHelp.mockReturnValueOnce('/help/dir');
    mockGetSelectedCategories.mockReturnValueOnce(['category']);
    fs.existsSync.mockReturnValue(true);
    fs.readJsonSync.mockImplementation(() => {
      throw new Error();
    }); // index is corrupt

    expect(loadProjectGroupIndex('lang', 'tool', 'dir/', translate)).toEqual(expectedResult);
    expect(generateChapterGroupIndex).not.toBeCalled();
    expect(console.error).toBeCalled();
    expect(console.warn).not.toBeCalled();
  });

  it('is missing help dir', () => {
    const translate = jest.fn();
    const expectedResult = [];

    global.console = { error: jest.fn(), warn: jest.fn() };
    mockGetLatestTranslationHelp.mockReturnValueOnce(null);
    generateChapterGroupIndex.mockReturnValueOnce([]);

    expect(loadProjectGroupIndex('lang', 'tool', 'dir/', translate)).toEqual(expectedResult);
    expect(generateChapterGroupIndex.mock.calls.length).toBe(1); // chapter index is generated
    expect(console.error).not.toBeCalled();
    expect(console.warn).not.toBeCalled();
    expect(fs.readJsonSync).not.toBeCalled();
    expect(mockGetSelectedCategories).not.toBeCalled();
  });

  it('is missing category index', () => {
    const translate = jest.fn();
    const expectedResult = [];

    global.console = { error: jest.fn(), warn: jest.fn() };
    mockGetLatestTranslationHelp.mockReturnValueOnce('/help/dir');
    mockGetSelectedCategories.mockReturnValueOnce(['category']);
    fs.existsSync.mockReturnValue(false);// category index does not exist

    expect(loadProjectGroupIndex('lang', 'tool', 'dir/', translate)).toEqual(expectedResult);
    expect(generateChapterGroupIndex).not.toBeCalled();
    expect(fs.readJsonSync).not.toBeCalled();
    expect(console.error).not.toBeCalled();
    expect(console.warn).toBeCalled();
  });

  it('has no selected categories', () => {
    const translate = jest.fn();
    const expectedResult = [];

    global.console = { error: jest.fn(), warn: jest.fn() };
    mockGetLatestTranslationHelp.mockReturnValueOnce('/help/dir');
    mockGetSelectedCategories.mockReturnValueOnce([]); // empty selection

    expect(loadProjectGroupIndex('lang', 'tool', 'dir/', translate)).toEqual(expectedResult);
    expect(generateChapterGroupIndex).not.toBeCalled();
    expect(fs.readJsonSync).not.toBeCalled();
    expect(fs.lstatSync).not.toBeCalled();
    expect(console.error).not.toBeCalled();
    expect(console.warn).not.toBeCalled();
  });
});
