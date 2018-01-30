jest.mock('fs-extra');
import fs from 'fs-extra';
import path from 'path-extra';
import ospath from 'ospath';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
// actions
import * as ProjectImportFilesystemActions from '../src/js/actions/Import/ProjectImportFilesystemActions';
// Mock store set up
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
// constants
const IMPORTS_PATH = path.join(ospath.home(), 'translationCore', 'imports');

describe('ProjectImportFilesystemActions.deleteProjectFromImportsFolder', ()=> {
  test('ProjectImportFilesystemActions.deleteProjectFromImportsFolder should remove a project from the imports folder', () => {
    const pathLocation = path.join(IMPORTS_PATH, 'PROJECT_NAME');
    fs.__setMockFS({
      [pathLocation]: ''
    });

    const store = mockStore({
      localImportReducer: {
        selectedProjectFilename: 'PROJECT_NAME'
      }
    });

    store.dispatch(ProjectImportFilesystemActions.deleteProjectFromImportsFolder());
    expect(fs.existsSync(pathLocation)).toBeFalsy();
  });
});
