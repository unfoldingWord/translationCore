/* eslint-env jest */
import path from 'path-extra';
import fs from 'fs-extra';
//helpers
import * as OnlineImportWorkflowHelpers from '../src/js/helpers/Import/OnlineImportWorkflowHelpers';
require('jest');
const IMPORTS_PATH = path.join(path.homedir(), 'translationCore', 'imports');
jest.mock('fs-extra');

describe('OnlineImportWorkflowHelpers.clone', function () {

  beforeEach(() => {
    // clear out test projects
    ['bhadrawahi_tit', 'noprojecthere'].forEach((file) => {
      const savePath = path.join(path.homedir(), 'translationCore', 'projects', file);
      fs.removeSync(savePath); // clear out
    });
  });

  test('OnlineImportWorkflowHelpers.clone should succeed on valid URL', async () => {
    const url = 'https://git.door43.org/klappy/bhadrawahi_tit.git';
    let fileName = await OnlineImportWorkflowHelpers.clone(url);
    let projectImportPath = path.join(IMPORTS_PATH, fileName);
    expect(fileName).toBe('bhadrawahi_tit');
    expect(fs.existsSync(projectImportPath)).toBeTruthy();
    fs.removeSync(projectImportPath);
  });

  test('OnlineImportWorkflowHelpers.clone null link should show error', async () => {
    const url = null;
    try {
      await OnlineImportWorkflowHelpers.clone(url);
    } catch (e) {
      expect(e).toBe('The URL null does not reference a valid project');
    }
  });

  test('OnlineImportWorkflowHelpers.clone should handle missing .git', async () => {
    const url = 'https://git.door43.org/klappy/bhadrawahi_tit';
    let fileName = await OnlineImportWorkflowHelpers.clone(url);
    let projectImportPath = path.join(IMPORTS_PATH, fileName);
    expect(fileName).toBe('bhadrawahi_tit');
    expect(fs.existsSync(projectImportPath)).toBeTruthy();
    fs.removeSync(projectImportPath);
  });

  test('OnlineImportWorkflowHelpers.clone with access error should show error', async () => {
    const url = 'https://git.door43.org/Danjuma_Alfred_H/sw_tit_text_ulb.git';
    try {
      await OnlineImportWorkflowHelpers.clone(url);
    } catch (e) {
      expect(e.includes('Project not found')).toBeTruthy();
    }
  });

  test('OnlineImportWorkflowHelpers.clone with disconnect should show error', async () => {
    jest.mock('simple-git');
    const url = 'https://git.door43.org/you_have_bad_connection/this_will_fail.git';
    try {
      await OnlineImportWorkflowHelpers.clone(url);
    } catch (e) {
      console.log(e);
    }
  });

  // test('OnlineImportWorkflowHelpers.clone failed to load should show error', () => {
  //     return new Promise((resolve) => {
  //         const expectedURL = 'https://git.door43.org/Danjuma_Alfred_H/sw_tit_text_ulb.git';
  //         const expectedErrorStr = "Unable to connect to the server. Please check your Internet connection.";
  //         const gitErrorMessage = "Cloning into 'xxx'...\nfatal: Failed to load\n";
  //         const { mock_git, mock_dispatch, mock_handleImportResults } = mockImport(gitErrorMessage);
  //         OnlineImportWorkflowHelpers.clone(expectedURL, mock_dispatch, mock_handleImportResults, mock_git);

  //         expect(returnedErrorMessage.toString().includes(expectedErrorStr)).toBe(true);
  //         resolve();
  //     });
  // });

  // test('OnlineImportWorkflowHelpers.clone with missing source should show error', () => {
  //     return new Promise((resolve) => {
  //         const expectedURL = 'https://git.door43.org/Danjuma_Alfred_H/sw_tit_text_ulb.git';
  //         const expectedErrorStr = "Project not found";
  //         const gitErrorMessage = "Cloning into 'xxx'...\nfatal: repository '" + expectedURL + "' not found\n";
  //         const { mock_git, mock_dispatch, mock_handleImportResults } = mockImport(gitErrorMessage);
  //         OnlineImportWorkflowHelpers.clone(expectedURL, mock_dispatch, mock_handleImportResults, mock_git);

  //         expect(returnedErrorMessage.toString().includes(expectedErrorStr)).toBe(true);
  //         resolve();
  //     });
  // });

});
