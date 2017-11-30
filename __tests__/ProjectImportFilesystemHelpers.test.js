/* eslint-env jest */
/* eslint-disable no-console */
jest.mock('fs-extra');
import React from 'react';
import fs from 'fs-extra';
import path from 'path-extra';
// helpers
import * as ProjectImportFilesystemHelpers from '../src/js/helpers/Import/ProjectImportFilesystemHelpers';

// constants
const projectName   = 'aa_tit_text_ulb';
const IMPORTS_PATH  = path.join(path.homedir(), 'translationCore', 'imports');
const PROJECTS_PATH = path.join(path.homedir(), 'translationCore', 'projects');
const fromPath      = path.join(IMPORTS_PATH, projectName);
const toPath        = path.join(PROJECTS_PATH, projectName);
const reimportRejectMsg = (
  <div>
    The project you selected ({projectName}) already exists.<br />
    Reimporting existing projects is not currently supported.
  </div>
);
const noProjectInImportsFolderRejectMsg = (
  <div>
    Error occured while importing your project.<br />
    The project file {projectName} was not found in {fromPath}
  </div>
);

describe('ProjectImportFilesystemHelpers.move',()=> {
  test('ProjectImportFilesystemHelpers.move verifies that it does not reimport a project', () => {
    fs.__setMockFS({
      [toPath]: '',
      [fromPath]: ''
    });
    expect(ProjectImportFilesystemHelpers.move(projectName)).rejects.toThrow(
      reimportRejectMsg,
    );
  });

  test('ProjectImportFilesystemHelpers.move should fail/reject if the specified project is not found in the imports folder', () => {
    expect(ProjectImportFilesystemHelpers.move(projectName)).rejects.toThrow(
      noProjectInImportsFolderRejectMsg,
    );
  });

  test('ProjectImportFilesystemHelpers.move should move the file from imports folder to projects folder', () => {
    fs.__setMockFS({
      [fromPath]: ''
    });
    ProjectImportFilesystemHelpers.move(projectName).catch((error) => console.log(error));
    expect(fs.existsSync(toPath)).toBeTruthy();
    expect(fs.existsSync(fromPath)).toBeFalsy();
  });
});
