/* eslint-env jest */
import path from 'path-extra';
import fs from 'fs-extra';
// helpers
import * as zipHelpers from '../../scripts/resources/zipHelpers';
// constants
import { USER_RESOURCES_PATH, TRANSLATION_HELPS } from '../js/common/constants';

jest.mock('adm-zip', () => jest.fn().mockImplementation(() => ({
  addLocalFolder: mockAddLocalFolder,
  writeZip: mockWriteZip,
})));

const mockAddLocalFolder = jest.fn();
const mockWriteZip = jest.fn();

describe('zipHelpers.zipResourcesContent', () => {
  const jsonStuff = { stuff: 'stuff' };

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
    const languageId = 'el-x-koine';
    const version = 'v0.5';
    const bibleId = 'ugnt';
    const contentType = 'bibles';
    const resourcePath = path.join(USER_RESOURCES_PATH, languageId, contentType, bibleId, version);
    fs.ensureDirSync(resourcePath);
    fs.outputJsonSync(path.join(resourcePath, 'index.json'), jsonStuff);
    fs.outputJsonSync(path.join(resourcePath, 'manifest.json'), jsonStuff);
    const bookPath = path.join(resourcePath, 'tit');
    fs.outputJsonSync(path.join(bookPath, '1.json'), jsonStuff);

    // when
    await zipHelpers.zipResourcesContent(USER_RESOURCES_PATH, languageId);

    // then
    expect(mockWriteZip).toHaveBeenCalledTimes(expectZip ? 1 : 0);
  });

  it('should skip already zipped bible', async () => {
    // given
    const expectZip = false;
    const languageId = 'el-x-koine';
    const version = 'v0.5';
    const bibleId = 'ugnt';
    const contentType = 'bibles';
    const resourcePath = path.join(USER_RESOURCES_PATH, languageId, contentType, bibleId, version);
    fs.ensureDirSync(resourcePath);
    fs.outputJsonSync(path.join(resourcePath, 'index.json'), jsonStuff);
    fs.outputJsonSync(path.join(resourcePath, 'manifest.json'), jsonStuff);
    fs.outputJsonSync(path.join(resourcePath, 'books.zip'), jsonStuff);

    // when
    await zipHelpers.zipResourcesContent(USER_RESOURCES_PATH, languageId);

    // then
    expect(mockWriteZip).toHaveBeenCalledTimes(expectZip ? 1 : 0);
  });

  it('should zip content', async () => {
    // given
    const expectZip = true;
    const languageId = 'el-x-koine';
    const version = 'v0.5';
    const contentType = 'translationWords';
    const resourcePath = path.join(USER_RESOURCES_PATH, languageId, TRANSLATION_HELPS, contentType, version);
    fs.ensureDirSync(resourcePath);
    fs.outputJsonSync(path.join(resourcePath, 'index.json'), jsonStuff);
    fs.outputJsonSync(path.join(resourcePath, 'manifest.json'), jsonStuff);
    const contentPath = path.join(resourcePath, 'kt/groups/tit');
    fs.outputJsonSync(path.join(contentPath, 'apostle.json'), jsonStuff);

    // when
    await zipHelpers.zipResourcesContent(USER_RESOURCES_PATH, languageId);

    // then
    expect(mockWriteZip).toHaveBeenCalledTimes(expectZip ? 1 : 0);
  });

  it('should skip already zipped content', async () => {
    // given
    const expectZip = false;
    const languageId = 'el-x-koine';
    const version = 'v0.5';
    const contentType = 'translationWords';
    const resourcePath = path.join(USER_RESOURCES_PATH, languageId, TRANSLATION_HELPS, contentType, version);
    fs.ensureDirSync(resourcePath);
    fs.outputJsonSync(path.join(resourcePath, 'contents.zip'), jsonStuff);

    // when
    await zipHelpers.zipResourcesContent(USER_RESOURCES_PATH, languageId);

    // then
    expect(mockWriteZip).toHaveBeenCalledTimes(expectZip ? 1 : 0);
  });
});

