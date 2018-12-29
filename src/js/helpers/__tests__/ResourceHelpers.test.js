import { generateChapterGroupData } from "../groupDataHelpers";

jest.mock("../groupDataHelpers");
jest.mock("../ProjectAPI");
jest.mock("../ResourceAPI");
jest.mock("fs-extra");

import fs from "fs-extra";
import {
  mockIsCategoryLoaded,
  mockSetCategoryLoaded,
  mockImportCategoryGroupData,
  mockGetCategoriesDir,
  mockGetBookId
} from "../ProjectAPI";
import { mockGetLatestTranslationHelp } from "../ResourceAPI";

import {
  copyGroupDataToProject,
  loadProjectGroupIndex
} from "../ResourcesHelpers";

describe("copy group data", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("copies group data", () => {
    mockGetLatestTranslationHelp.mockReturnValueOnce("/help/dir");
    fs.readdirSync.mockReturnValueOnce(["names", "other"]);
    fs.lstatSync.mockReturnValue({
      isDirectory: () => true
    });
    mockIsCategoryLoaded.mockReturnValueOnce(false);
    mockIsCategoryLoaded.mockReturnValueOnce(true); // other category is loaded and will be skipped
    fs.readdirSync.mockReturnValueOnce(["group1", "group2"]);

    copyGroupDataToProject("lang", "tool", "project/");
    expect(mockImportCategoryGroupData).toBeCalledWith("tool", "/help/dir/names/group1");
    expect(mockImportCategoryGroupData).toBeCalledWith("tool", "/help/dir/names/group2");
    expect(mockImportCategoryGroupData.mock.calls.length).toBe(2);
    expect(mockSetCategoryLoaded).toBeCalledWith("tool", "names");
    expect(mockSetCategoryLoaded.mock.calls.length).toBe(1);
    expect(generateChapterGroupData).not.toBeCalled();
  });

  it("has no group data", () => {
    mockGetLatestTranslationHelp.mockReturnValueOnce("/help/dir");
    fs.readdirSync.mockReturnValueOnce([]);

    copyGroupDataToProject("lang", "tool", "project/");
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
  it("has an index", () => {
    expect(loadProjectGroupIndex()).toEqual();
  });

  it("has a corrupt index", () => {

  });

  it("is missing help dir", () => {

  });
});
