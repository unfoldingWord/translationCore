/* eslint-env jest */
/* eslint-disable no-console */
jest.mock('fs-extra');
import React from 'react';
import fs from 'fs-extra';
import path from 'path-extra';
import ospath from 'ospath';
// helpers
import * as ProjectImportFilesystemHelpers from '../src/js/helpers/Import/ProjectImportFilesystemHelpers';

// constants
const projectName   = 'aa_tit_text_ulb';
const IMPORTS_PATH  = path.join(ospath.home(), 'translationCore', 'imports');
const PROJECTS_PATH = path.join(ospath.home(), 'translationCore', 'projects');
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
  beforeEach(()=>{
    fs.__resetMockFS();
  });

  test('ProjectImportFilesystemHelpers.move verifies that it does not reimport a project', async () => {
    fs.__setMockFS({
      [toPath]: '',
      [fromPath]: ''
    });
    expect.assertions(1);
   expect(ProjectImportFilesystemHelpers.move(projectName)).rejects.toEqual(reimportRejectMsg);
  });

  test('ProjectImportFilesystemHelpers.move should fail/reject if the specified project is not found in the imports folder', () => {
    expect.assertions(1);
    expect(ProjectImportFilesystemHelpers.move(projectName)).rejects.toEqual(noProjectInImportsFolderRejectMsg);
  });

  test('ProjectImportFilesystemHelpers.move should move the file from imports folder to projects folder', () => {
    fs.__setMockFS({
      [fromPath]: ''
    });
    expect(ProjectImportFilesystemHelpers.move(projectName)).resolves.toBe();
    expect(fs.existsSync(toPath)).toBeTruthy();
    expect(fs.existsSync(fromPath)).toBeFalsy();
  });
});
