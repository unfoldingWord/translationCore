/* eslint-env jest */
/* eslint-disable no-console */
'use strict';

jest.mock('fs-extra');
jest.mock('adm-zip');

import fs from 'fs-extra';
import path from 'path-extra';
// helpers
import * as ImportLocalHelpers from '../src/js/helpers/ImportLocalHelpers';

describe('ImportLocalHelpers.importProjectAndMoveToMyProjects', () => {
  const DEFAULT_SAVE = path.join(path.homedir(), 'translationCore', 'projects');
  const TEMP_IMPORT_PATH = path.join(path.homedir(), 'translationCore', 'imports', 'temp');
  const projectName = 'id_tit_text_ulb';

  beforeEach(() => {
    fs.__setMockFS({
      [DEFAULT_SAVE]: [],
      [TEMP_IMPORT_PATH]: []
    });
  });

  test('importProjectAndMoveToMyProjects should unzip a .tstudio project and move it to projects folder', () => {
    ImportLocalHelpers.importProjectAndMoveToMyProjects('source/path/to/project/id_tit_text_ulb', projectName);
    const projectPath = path.join(DEFAULT_SAVE, projectName);
    expect(fs.existsSync(projectPath)).toBeTruthy();
  });

  test('importProjectAndMoveToMyProjects should remove the unzzipped files from the imports folder', () => {
    ImportLocalHelpers.importProjectAndMoveToMyProjects('source/path/to/project/id_tit_text_ulb', projectName);
    const tempFilesPath = path.join(TEMP_IMPORT_PATH, projectName);
    expect(fs.existsSync(tempFilesPath)).toBeFalsy();
    expect(fs.existsSync(TEMP_IMPORT_PATH)).toBeFalsy();
  });
});
