// for performance testing
import fs from 'fs-extra';
import path from 'path-extra';
import usfm from 'usfm-js';
// import { performance } from 'perf_hooks';
// helpers
import * as UsfmHelpers from '../src/js/helpers/usfmHelpers';
import * as UsfmFileConversionHelpers from '../src/js/helpers/FileConversionHelpers/UsfmFileConversionHelpers';

// constants
import { IMPORTS_PATH } from '../src/js/common/constants';
jest.unmock('fs-extra');
const usfmFilePath = path.join(__dirname, 'fixtures/usfm3', '41-MAT-aligned.usfm');

describe.skip('UsfmFileConversionHelpers2', () => {

  describe('generateTargetLanguageBibleFromUsfm()', () => {
    const count = 2;
    let asyncSum = 0;
    let syncSum = 0;

    beforeEach(() => {
      const projectFilename = 'project_folder_name';
      const projectImportsPath = path.join(IMPORTS_PATH, projectFilename);
      fs.removeSync(projectImportsPath);
    });

    for (let i = 0; i < count; i++) {
      test('valid USFM should succeed SYNC ' + i, async () => {
        // given
        let mockManifest = {
          project: { id: 'mat' },
          target_language: { id: 'en' },
        };
        const validUsfmString = fs.readFileSync(usfmFilePath, 'utf8');
        const parsedUsfm = UsfmHelpers.getParsedUSFM(validUsfmString);
        const projectFilename = 'project_folder_name';
        const projectImportsPath = path.join(IMPORTS_PATH, projectFilename);
        const newUsfmProjectImportsPath = path.join(projectImportsPath, mockManifest.project.id);
        const start = performance.now();

        //when
        await UsfmFileConversionHelpers.generateTargetLanguageBibleFromUsfmBlocking(parsedUsfm, mockManifest, projectFilename);

        //then
        const end = performance.now();
        const elapsed = end - start;
        syncSum += elapsed;
        console.log(`Took ${elapsed}ms`);
        expect(fs.existsSync(newUsfmProjectImportsPath)).toBeTruthy();

        const chapter1_data = fs.readJSONSync(path.join(newUsfmProjectImportsPath, '1.json'));
        expect(Object.keys(chapter1_data).length - 1).toEqual(25);

        const chapter28_data = fs.readJSONSync(path.join(newUsfmProjectImportsPath, '28.json'));
        expect(Object.keys(chapter28_data).length - 1).toEqual(20);

        // verify header info is preserved
        const header_data = fs.readJSONSync(path.join(newUsfmProjectImportsPath, 'headers.json'));
        validateUsfmTag(header_data, 'id', validUsfmString);
        validateUsfmTag(header_data, 'h', validUsfmString);
        validateUsfmTag(header_data, 'mt', validUsfmString);
        validateUsfmTag(header_data, 's5', validUsfmString);
      });

      test('valid USFM should succeed ASYNC ' + i, async () => {
        // given
        let mockManifest = {
          project: { id: 'mat' },
          target_language: { id: 'en' },
        };
        const validUsfmString = fs.readFileSync(usfmFilePath, 'utf8');
        const parsedUsfm = UsfmHelpers.getParsedUSFM(validUsfmString);
        const projectFilename = 'project_folder_name';
        const projectImportsPath = path.join(IMPORTS_PATH, projectFilename);
        const newUsfmProjectImportsPath = path.join(projectImportsPath, mockManifest.project.id);
        const start = performance.now();

        //when
        await UsfmFileConversionHelpers.generateTargetLanguageBibleFromUsfm(parsedUsfm, mockManifest, projectFilename);

        //then
        const end = performance.now();
        const elapsed = end - start;
        asyncSum += elapsed;
        console.log(`Took ${elapsed}ms`);
        expect(fs.existsSync(newUsfmProjectImportsPath)).toBeTruthy();

        const chapter1_data = fs.readJSONSync(path.join(newUsfmProjectImportsPath, '1.json'));
        expect(Object.keys(chapter1_data).length - 1).toEqual(25);

        const chapter28_data = fs.readJSONSync(path.join(newUsfmProjectImportsPath, '28.json'));
        expect(Object.keys(chapter28_data).length - 1).toEqual(20);

        // verify header info is preserved
        const header_data = fs.readJSONSync(path.join(newUsfmProjectImportsPath, 'headers.json'));
        validateUsfmTag(header_data, 'id', validUsfmString);
        validateUsfmTag(header_data, 'h', validUsfmString);
        validateUsfmTag(header_data, 'mt', validUsfmString);
        validateUsfmTag(header_data, 's5', validUsfmString);
      });

    }

    test('summary', () => {
      const aveSyncTime = syncSum/count;
      console.log(`Average SYNC time is ${aveSyncTime}ms`);
      const aveAsyncTime = asyncSum/count;
      console.log(`Average ASYNC time is ${aveAsyncTime}ms`);
      const diff = (1 - aveAsyncTime/aveSyncTime) * 100;
      console.log(`Delta is ${diff}%`);
    });

  });

});

//
// helpers
//

function wrapWithUSFM(text, splitAt, beginMarker, endMarker) {
  const parts = text.split(splitAt);
  const wrapped = beginMarker + parts.join(endMarker + splitAt + beginMarker) + endMarker;
  return wrapped;
}

function validateUsfmTag(header_data, tag, usfmString) {
  const data = UsfmHelpers.getHeaderTag(header_data, tag);
  let match = '\\' + tag;

  if (data) {
    match += ' ' + data;
  }

  const index = usfmString.indexOf(match);
  const found = (index >= 0);
  if (!found) {
    console.log(`Validating tag ${tag}, looking for \n${match}`);
  }
  expect(found).toBeTruthy();
}

export const getUsfmFromJson = (verseData) => {
  const outputData = {
    'chapters': {},
    'headers': [],
    'verses': { '1': verseData },
  };
  const USFM = usfm.toUSFM(outputData, { chunk: true });
  let split = USFM.split('\\v 1 ');

  if (split.length <= 1) {
    split = USFM.split('\\v 1');
  }
  return split.length > 1 ? split[1] : '';
};
