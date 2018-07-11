jest.mock('fs-extra');
import fs from 'fs-extra';
import path from 'path-extra';
import ospath from 'ospath';

// actions
import * as ProjectImportFilesystemHelpers from '../src/js/helpers/Import/ProjectImportFilesystemHelpers';

// constants
const IMPORTS_PATH = path.join(ospath.home(), 'translationCore', 'imports');

describe('ProjectImportFilesystemActions', () => {
  afterAll(() => {
    fs.__resetMockFS();
  });
  test('deleteProjectFromImportsFolder: should remove the imports folder', () => {
    const pathLocation = path.join(IMPORTS_PATH, 'PROJECT_NAME');
    fs.__resetMockFS();
    fs.ensureDirSync(pathLocation);
    expect(fs.statSync(pathLocation).exists).toBeTruthy();
    ProjectImportFilesystemHelpers.deleteImportsFolder();
    expect(fs.statSync(pathLocation).exists).toBeFalsy();
  });
});