jest.mock('fs-extra');
import fs from 'fs-extra';
import path from 'path-extra';
// actions
import * as ProjectImportFilesystemHelpers from '../src/js/helpers/Import/ProjectImportFilesystemHelpers';
// constants
import { IMPORTS_PATH } from '../src/js/common/constants';

describe('ProjectImportFilesystemActions', () => {
  afterAll(() => {
    fs.__resetMockFS();
  });
  test('deleteProjectFromImportsFolder: should remove the imports folder', async () => {
    const pathLocation = path.join(IMPORTS_PATH, 'PROJECT_NAME');
    fs.__resetMockFS();
    fs.ensureDirSync(pathLocation);
    expect(fs.statSync(pathLocation).exists).toBeTruthy();
    await ProjectImportFilesystemHelpers.deleteImportsFolder();
    expect(fs.statSync(pathLocation).exists).toBeFalsy();
  });
});
