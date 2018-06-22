import configureMockStore from 'redux-mock-store';
import fs from 'fs-extra';
import thunk from 'redux-thunk';
import path from 'path-extra';
import ospath from 'ospath';
import * as ProjectLoadingActions from "../src/js/actions/MyProjects/ProjectLoadingActions";
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
const importProjectName = 'project';
const PROJECTS_PATH = path.join(ospath.home(), 'translationCore', 'projects');

jest.mock('fs-extra');

jest.mock('../src/js/selectors', () => ({
  getActiveLocaleLanguage: () => {
    return {code: 'en'};
  },
  getTranslate: () => {
    return jest.fn((code) => {
      return code;
    });
  }
}));


describe('ProjectLoadingActions.migrateValidateLoadProject', () => {
  let initialState = {};
  const projectName = 'en_tit';
  const sourcePath = "__tests__/fixtures/project/";
  const projectPath = path.join(PROJECTS_PATH,projectName);
  beforeEach(() => {
    // reset mock filesystem data
    fs.__resetMockFS();
    let copyFiles = [projectName];
    fs.__loadFilesIntoMockFs(copyFiles, sourcePath, PROJECTS_PATH);

    initialState = {
      homeScreenReducer: {
        stepper: {
          stepIndex: 1,
          nextStepName: 'Project Information',
          previousStepName: 'Cancel',
          nextDisabled: false
        }
      },
      loginReducer: {
        loggedInUser: false,
        userdata: {},
        feedback: '',
        subject: 'Bug Report',
        placeholder: 'Leave us your feedback!'
      },
      projectDetailsReducer: {
        projectSaveLocation: '',
        manifest: {},
        currentProjectToolsProgress: {},
        projectType: null
      },
      localImportReducer: {
        selectedProjectFilename: '',
        sourceProjectPath: '',
        oldSelectedProjectFileName: null
      },
      projectInformationCheckReducer: {}
    };
  });

  it('should open valid project', () => {
    // given
    const store = mockStore(initialState);
    const selectedProjectFilename = projectName;
    // when
    return store.dispatch(ProjectLoadingActions.migrateValidateLoadProject(selectedProjectFilename)).then(() => {
      //then
      expect(store.getActions()).toMatchSnapshot();
    });
  }, 5000);

  it('should not open invalid project', () => {
    // given
    const store = mockStore(initialState);
    const selectedProjectFilename = 'test';
    // when
    return store.dispatch(ProjectLoadingActions.migrateValidateLoadProject(selectedProjectFilename)).then(() => {
      //then
      expect(store.getActions()).toMatchSnapshot();
    });
  }, 5000);

});
