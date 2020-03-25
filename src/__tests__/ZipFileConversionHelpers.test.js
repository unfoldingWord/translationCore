/* eslint-env jest */
/* eslint-disable no-console */
import fs from 'fs-extra';
import path from 'path-extra';
// helpers
import * as ZipFileConversionHelpers from '../js/helpers/FileConversionHelpers/ZipFileConversionHelpers';
// constants
import { IMPORTS_PATH, TEMP_IMPORT_PATH } from '../js/common/constants';
jest.mock('fs-extra');
jest.mock('adm-zip');

describe('ZipFileConversionHelpers.convertToProjectFormat', () => {
  const projectName = 'id_tit_text_ulb';

  beforeEach(() => {
    fs.__setMockFS({
      [IMPORTS_PATH]: [],
      [TEMP_IMPORT_PATH]: [],
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
