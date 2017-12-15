import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as ProjectImportStepperActions from '../src/js/actions/ProjectImportStepperActions';
import path from 'path';
import * as fs from 'fs-extra';
jest.mock('fs-extra');

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
const IMPORT_PATH = '__tests__/fixtures/project/migration/import';

describe('LocalImportWorkflowActions.selectLocalProject', () => {
  let initialState = {};
  const projectName = 'en_tit_ulb';
  const projectPath = path.join(IMPORT_PATH, projectName);

  beforeEach(() => {
    initialState = {
      projectDetailsReducer: {
        projectSaveLocation: projectPath,
        manifest: {},
        currentProjectToolsProgress: {},
        projectType: null
      }
    };
    // reset mock filesystem data
    fs.__resetMockFS();
    // Set up mocked out filePath and data in mock filesystem before each test
    fs.__setMockFS({
      [projectPath]: ['manifest.json'],
      [path.join(projectPath, 'manifest.json')]: {}
    });

  });

  it('on cancel, should delete project', () => {
    // given
    const store = mockStore(initialState);
    const getState = () => {
      return store.getState();
    };
    const dispatch = jest.fn();
    expect(fs.existsSync(projectPath)).toBeTruthy(); // path should be initialzed

    // when
    const cancelFunction = ProjectImportStepperActions.cancelProjectValidationStepper();
    cancelFunction(dispatch, getState);

    // then
    expect(fs.existsSync(projectPath)).not.toBeTruthy(); // path should be deleted
  });
});
