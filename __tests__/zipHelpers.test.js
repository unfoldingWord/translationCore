/* eslint-env jest */

import * as zipHelpers from '../scripts/resources/zipHelpers';
import path from 'path-extra';
import ospath from 'ospath';
import fs from "fs-extra";
import AdmZip from 'adm-zip';

const RESOURCES_PATH = path.join(ospath.home(), 'translationCore', 'resources');

describe('zipHelpers.zipResourcesContent', () => {
  const jsonStuff = { stuff: "stuff"};

  beforeEach(() => {
    // reset mock filesystem data
    fs.__resetMockFS();
  });

  it('should zip bible', async () => {
    // given
    const languageId = "el-x-koine";
    const version = "0.5";
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
    expect(true).toEqual(false);
  });
});

