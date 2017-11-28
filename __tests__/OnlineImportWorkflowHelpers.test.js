import path from 'path';
import pathex from 'path-extra';
import * as fs from 'fs-extra';
import * as OnlineImportWorkflowHelpers from '../src/js/helpers/Import/OnlineImportWorkflowHelpers';
const STANDARD_PROJECT = 'https://git.door43.org/royalsix/es-419_tit_text_ulb.git';
const PROJECT_NAME = 'es-419_tit_text_ulb';
const IMPORTS_PATH = path.join(pathex.homedir(), 'translationCore', 'imports');

jest.unmock('simple-git');

describe('OnlineImportWorkflowHelpers.cloneRepo', () => {
  it('should clone a repo to the projects folder in the FS', () => {
    let pathToProject = path.join(IMPORTS_PATH, PROJECT_NAME);
    OnlineImportWorkflowHelpers.cloneRepo(STANDARD_PROJECT);
    let projectExists = fs.existsSync(pathToProject);
    expect(projectExists).toBeTruthy();
  });
});
