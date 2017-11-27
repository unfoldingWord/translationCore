import path from 'path-extra';
import * as fs from 'fs-extra';
import * as OnlineImportWorkflowHelpers from '../src/js/helpers/Import/OnlineImportWorkflowHelpers';
const STANDARD_PROJECT = 'https://git.door43.org/royalsix/es-419_tit_text_ulb';
const PROJECTS_PATH = path.join(path.homedir(), 'translationCore', 'projects');


describe('OnlineImportWorkflowHelpers.cloneRepo', () => {
  it('should clone a repo to the projects folder in the FS', () => {
    let projectName = 'es-419_tit_text_ulb';
    let pathToProject = path.join(PROJECTS_PATH, projectName);
    OnlineImportWorkflowHelpers.cloneRepo(STANDARD_PROJECT);
    let projectExists = fs.existsSync(pathToProject);
    expect(projectExists).toBeTruthy();
  });
});