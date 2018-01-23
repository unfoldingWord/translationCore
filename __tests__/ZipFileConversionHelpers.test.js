/* eslint-env jest */
/* eslint-disable no-console */
'use strict';

jest.mock('fs-extra');
jest.mock('adm-zip');

import fs from 'fs-extra';
import path from 'path-extra';
// helpers
import * as ZipFileConversionHelpers from '../src/js/helpers/FileConversionHelpers/ZipFileConversionHelpers';

describe('ZipFileConversionHelpers.convertToProjectFormat', () => {
  const IMPORTS_PATH = path.join(path.homedir(), 'translationCore', 'imports');
  const TEMP_IMPORT_PATH = path.join(path.homedir(), 'translationCore', 'imports', 'temp');
  const projectName = 'id_tit_text_ulb';

  beforeEach(() => {
    fs.__setMockFS({
      [IMPORTS_PATH]: [],
      [TEMP_IMPORT_PATH]: []
    });
  });

  test('convertToProjectFormat should unzip a .tstudio or a .tcore project and move it to projects folder', () => {
    ZipFileConversionHelpers.convertToProjectFormat(path.join('source', 'path', 'to', 'project', 'id_tit_text_ulb'), projectName);
    const projectPath = path.join(IMPORTS_PATH, projectName);
    expect(fs.existsSync(projectPath)).toBeTruthy();
  });

  test('convertToProjectFormat should remove the unzzipped files from the imports folder', () => {
    ZipFileConversionHelpers.convertToProjectFormat(path.join('source', 'path', 'to', 'project', 'id_tit_text_ulb'), projectName);
    const tempFilesPath = path.join(TEMP_IMPORT_PATH, projectName);
    expect(fs.existsSync(tempFilesPath)).toBeFalsy();
    expect(fs.existsSync(TEMP_IMPORT_PATH)).toBeFalsy();
  });
});
