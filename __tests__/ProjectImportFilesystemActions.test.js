jest.mock('fs-extra');
import fs from 'fs-extra';
import path from 'path-extra';
import ospath from 'ospath';

// actions
import * as ProjectImportFilesystemActions from '../src/js/actions/Import/ProjectImportFilesystemActions';

// constants
const IMPORTS_PATH = path.join(ospath.home(), 'translationCore', 'imports');

describe('ProjectImportFilesystemActions', () => { 
  test('deleteProjectFromImportsFolder: should remove the imports folder', () => {
    const pathLocation = path.join(IMPORTS_PATH, 'PROJECT_NAME');
    fs.__setMockFS({
      [pathLocation]: ''
    });
    expect(fs.statSync(pathLocation).exists).toBeTruthy();
    ProjectImportFilesystemActions.deleteProjectFromImportsFolder();
    expect(fs.statSync(pathLocation).exists).toBeFalsy();
  });
});
