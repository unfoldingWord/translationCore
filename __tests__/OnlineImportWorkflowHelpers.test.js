import path from 'path';
import pathex from 'path-extra';
import * as OnlineImportWorkflowHelpers from '../src/js/helpers/Import/OnlineImportWorkflowHelpers';
const STANDARD_PROJECT = 'https://git.door43.org/royalsix/es-419_tit_text_ulb.git';
const PROJECT_NAME = 'es-419_tit_text_ulb';
const IMPORTS_PATH = path.join(pathex.homedir(), 'translationCore', 'imports');

describe('OnlineImportWorkflowHelpers.cloneRepo', () => {
  it('should clone a repo to the projects folder in the FS', () => {
    let pathToProject = path.join(IMPORTS_PATH, PROJECT_NAME);
    OnlineImportWorkflowHelpers.cloneRepo(STANDARD_PROJECT).then(()=>{
      let projectExists = fs.existsSync(pathToProject);
      expect(projectExists).toBeTruthy();
    });
  });

});

describe('OnlineImportWorkflowHelpers.getValidGitUrl', () => {
  it('should return the git.door43.org for a live.door43.org link', () => {
    let url = 'https://live.door43.org/u/richmahn/en_tit_ulb/120df21085/';
    let gitUrl = OnlineImportWorkflowHelpers.getValidGitUrl(url);
    let expectedUrl = 'https://git.door43.org/richmahn/en_tit_ulb.git';
    expect(gitUrl).toBe(expectedUrl);
  });

  it('should return the git.door43.org for a www.door43.org link', () => {
    let url = 'https://www.door43.org/u/richmahn/en_tit_ulb/120df21085/';
    let gitUrl = OnlineImportWorkflowHelpers.getValidGitUrl(url);
    let expectedUrl = 'https://git.door43.org/richmahn/en_tit_ulb.git';
    expect(gitUrl).toBe(expectedUrl);
  });

  it('should return the git.door43.org for a door43.org link', () => {
    let url = 'https://www.door43.org/u/richmahn/en_tit_ulb/';
    let gitUrl = OnlineImportWorkflowHelpers.getValidGitUrl(url);
    let expectedUrl = 'https://git.door43.org/richmahn/en_tit_ulb.git';
    expect(gitUrl).toEqual(expectedUrl);
  });

  it('should return the git.door43.org for a git.door43.org link', () => {
    let url = '   https://git.door43.org/richmahn/en_tit_ulb   ';
    let gitUrl = OnlineImportWorkflowHelpers.getValidGitUrl(url);
    let expectedUrl = 'https://git.door43.org/richmahn/en_tit_ulb.git';
    expect(gitUrl).toEqual(expectedUrl);
  });

  it('should return an empty string for a bad link', () => {
    let url = 'https://bad.door43.org/u/richmahn/en_tit_ulb';
    let gitUrl = OnlineImportWorkflowHelpers.getValidGitUrl(url);
    let expectedUrl = '';
    expect(gitUrl).toEqual(expectedUrl);
  });
});

describe('OnlineImportWorkflowHelpers.getProjectName', () => {
  it('should return the project name of a git.door43.org link', () => {
    let url = 'https://git.door43.org/richmahn/en_tit_ulb.git';
    let projectName = OnlineImportWorkflowHelpers.getProjectName(url);
    let expectedProjectName = 'en_tit_ulb';
    expect(projectName).toEqual(expectedProjectName);
  });

  it('should return an empty string for a bad git link', () => {
    let url = 'https://bad.door43.org/richmahn/en_tit_ulb';
    let gitUrl = OnlineImportWorkflowHelpers.getValidGitUrl(url);
    let expectedUrl = '';
    expect(gitUrl).toEqual(expectedUrl);
  });
});

describe('OnlineImportWorkflowHelpers.convertGitErrorMessage', () => {
  it('should return the expected human-friendly error message', () => {
    const expectedErrorMessages = {
      'unknown': 'An unknown problem occurred during import',
      'fatal: unable to accesss': 'Unable to connect to the server. Please check your Internet connection.',
      'fatal: The remote end hung up': 'Unable to connect to the server. Please check your Internet connection.',
      'Failed to load': 'Unable to connect to the server. Please check your Internet connection.',
      'fatal: repository not found': "Project not found: '" + STANDARD_PROJECT + "'"
    };
    for(let err in expectedErrorMessages) {
      let errorMessage = OnlineImportWorkflowHelpers.convertGitErrorMessage(err, STANDARD_PROJECT);
      expect(errorMessage).toBe(expectedErrorMessages[err]);
    }
  });
});
