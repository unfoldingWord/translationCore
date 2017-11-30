/* eslint-env jest */
/* eslint-disable no-console */
jest.mock('fs-extra');
import React from 'react';
import fs from 'fs-extra';
import path from 'path-extra';
// helpers
import * as ProjectImportFilesystemHelpers from '../src/js/helpers/Import/ProjectImportFilesystemHelpers';

// constants
const projectName = 'aa_tit_text_ulb';
const IMPORTS_PATH = path.join(path.homedir(), 'translationCore', 'imports');
const PROJECTS_PATH = path.join(path.homedir(), 'translationCore', 'projects');
const fromPath = path.join(IMPORTS_PATH, projectName);
const toPath   = path.join(PROJECTS_PATH, projectName);
const reimportAlert = (
  <div>
    The project you selected ({projectName}) already exists.<br />
    Reimporting existing projects is not currently supported.
  </div>
);

describe('ProjectImportFilesystemHelpers.move',()=> {
  test('ProjectImportFilesystemHelpers.move verifies that it does not reimport a project', () => {
    fs.__setMockFS({
      [toPath]: '',
      [fromPath]: ''
    });
    expect(ProjectImportFilesystemHelpers.move(projectName)).rejects.toThrow(
      reimportAlert,
    );
  });
  test('', () => {
    fs.__setMockFS({
      [fromPath]: ''
    });
  });
});
