/* eslint-env jest */

import * as zipHelpers from '../scripts/resources/zipHelpers';
import path from 'path-extra';
import ospath from 'ospath';
import fs from "fs-extra";

const mockAddLocalFolder = jest.fn();
const mockWriteZip = jest.fn();
jest.mock('adm-zip', () => {
  return jest.fn().mockImplementation(() => {
    return {
      addLocalFolder: mockAddLocalFolder,
      writeZip: mockWriteZip
    };
  });
});

const RESOURCES_PATH = path.join(ospath.home(), 'translationCore', 'resources');

describe('zipHelpers.zipResourcesContent', () => {
  const jsonStuff = { stuff: "stuff"};

  beforeEach(() => {
    // reset mock filesystem data
    fs.__resetMockFS();
  });

  afterEach(() => {
    mockAddLocalFolder.mockClear(); // clear call counts, but leave mock
    mockWriteZip.mockClear();
  });

  it('should zip bible', async () => {
    // given
    const expectZip = true;
    const languageId = "el-x-koine";
    const version = "v0.5";
    const bibleId = "ugnt";
    const contentType = "bibles";
    const resourcePath = path.join(RESOURCES_PATH, languageId, contentType, bibleId, version);
    fs.ensureDirSync(resourcePath);
    fs.outputJsonSync(path.join(resourcePath, "index.json"), jsonStuff);
    fs.outputJsonSync(path.join(resourcePath, "manifest.json"), jsonStuff);
    const bookPath = path.join(resourcePath, 'tit');
    fs.outputJsonSync(path.join(bookPath, "1.json"), jsonStuff);

    // when
    await zipHelpers.zipResourcesContent(RESOURCES_PATH, languageId);

    // then
    expect(mockWriteZip).toHaveBeenCalledTimes(expectZip ? 1 : 0);
  });

  it('should skip already zipped bible', async () => {
    // given
    const expectZip = false;
    const languageId = "el-x-koine";
    const version = "v0.5";
    const bibleId = "ugnt";
    const contentType = "bibles";
    const resourcePath = path.join(RESOURCES_PATH, languageId, contentType, bibleId, version);
    fs.ensureDirSync(resourcePath);
    fs.outputJsonSync(path.join(resourcePath, "index.json"), jsonStuff);
    fs.outputJsonSync(path.join(resourcePath, "manifest.json"), jsonStuff);
    fs.outputJsonSync(path.join(resourcePath, "books.zip"), jsonStuff);

    // when
    await zipHelpers.zipResourcesContent(RESOURCES_PATH, languageId);

    // then
    expect(mockWriteZip).toHaveBeenCalledTimes(expectZip ? 1 : 0);
  });

  it('should zip content', async () => {
    // given
    const expectZip = true;
    const languageId = "el-x-koine";
    const version = "v0.5";
    const contentType = "translationWords";
    const resourcePath = path.join(RESOURCES_PATH, languageId, 'translationHelps', contentType, version);
    fs.ensureDirSync(resourcePath);
    fs.outputJsonSync(path.join(resourcePath, "index.json"), jsonStuff);
    fs.outputJsonSync(path.join(resourcePath, "manifest.json"), jsonStuff);
    const contentPath = path.join(resourcePath, 'kt/groups/tit');
    fs.outputJsonSync(path.join(contentPath, "apostle.json"), jsonStuff);

    // when
    await zipHelpers.zipResourcesContent(RESOURCES_PATH, languageId);

    // then
    expect(mockWriteZip).toHaveBeenCalledTimes(expectZip ? 1 : 0);
  });

  it('should skip already zipped content', async () => {
    // given
    const expectZip = false;
    const languageId = "el-x-koine";
    const version = "v0.5";
    const contentType = "translationWords";
    const resourcePath = path.join(RESOURCES_PATH, languageId, 'translationHelps', contentType, version);
    fs.ensureDirSync(resourcePath);
    fs.outputJsonSync(path.join(resourcePath, "contents.zip"), jsonStuff);

    // when
    await zipHelpers.zipResourcesContent(RESOURCES_PATH, languageId);

    // then
    expect(mockWriteZip).toHaveBeenCalledTimes(expectZip ? 1 : 0);
  });
});

