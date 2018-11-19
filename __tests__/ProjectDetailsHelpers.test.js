/* eslint-env jest */
import path from 'path-extra';
import ospath from 'ospath';
import fs from 'fs-extra';
import configureMockStore from "redux-mock-store";
import thunk from 'redux-thunk';
//helpers
import * as ProjectDetailsHelpers from '../src/js/helpers/ProjectDetailsHelpers';

// Mock store set up
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

//projects
const alignmentToolProject = path.join(__dirname, 'fixtures/project/wordAlignment/normal_project');
const emptyAlignmentToolProject = path.join(__dirname, 'fixtures/project/wordAlignment/empty_project');
const translationWordsProject = path.join(__dirname, 'fixtures/project/translationWords/normal_project');
const INDEX_FOLDER_PATH = path.join('.apps', 'translationCore', 'index');
const RESOURCE_PATH = path.join(ospath.home(), 'translationCore', 'resources');

jest.mock('../src/js/helpers/GitApi', () => ({ })); // TRICKY: we need this because GitApi is imported in dependency
jest.mock('material-ui/Checkbox');

let mock_repoExists = false;
let mock_repoError = false;
let mock_renameRepoCallCount = 0;
let mock_createNewRepoCallCount = 0;
jest.mock('../src/js/helpers/GogsApiHelpers', () => ({
  ...require.requireActual('../src/js/helpers/GogsApiHelpers'),
  changeGitToPointToNewRepo: () => {
    return new Promise((resolve) => {
      resolve();
    });
  },
  findRepo: () => {
    return new Promise((resolve, reject) => {
      if (mock_repoError) {
        reject('error');
      } else {
        resolve(mock_repoExists);
      }
    });
  },
  renameRepo: () => {
    return new Promise((resolve) => {
      mock_renameRepoCallCount++;
      resolve();
    });
  },
  createNewRepo: () => {
    return new Promise((resolve) => {
      mock_createNewRepoCallCount++;
      resolve();
    });
  }
}));

let mock_doOnlineConfirmCallback = false;
jest.mock('../src/js/actions/OnlineModeConfirmActions', () => ({
  confirmOnlineAction: jest.fn((onConfirm, onCancel) => (dispatch) => {
    dispatch({type: 'CONFIRM_ONLINE_MODE'});
    if (mock_doOnlineConfirmCallback) {
      onConfirm();
    } else {
      onCancel();
    }
  })
}));

jest.mock('../src/js/actions/ProjectInformationCheckActions', () => ({
  openOnlyProjectDetailsScreen: (projectSaveLocation) => (dispatch) => {
    dispatch({type: 'ProjectInformationCheckActions.openOnlyProjectDetailsScreen'});
  }
}));

let mock_alertCallbackButton = 0;
let mock_alertCallbackButtonText = null;
jest.mock('../src/js/actions/AlertModalActions', () => ({
  ...require.requireActual('../src/js/actions/AlertModalActions'),
  openOptionDialog: jest.fn((message, callback, button1, button2, buttonLinkText) =>
    (dispatch) => {
      //choose to export
      dispatch({
        type: 'OPEN_OPTION_DIALOG',
        alertText: message,
        button1: button1,
        button2: button2,
        buttonLink: buttonLinkText,
        callback: callback
      });
      mock_alertCallbackButtonText = null;
      switch (mock_alertCallbackButton) {
        case 1:
          mock_alertCallbackButtonText = button1;
          break;
        case 2:
          mock_alertCallbackButtonText = button2;
          break;
        case 3:
          mock_alertCallbackButtonText = buttonLinkText;
          break;
      }
      callback(mock_alertCallbackButtonText);
    })
}));

describe('ProjectDetailsHelpers.getWordAlignmentProgress', () => {
  const totalVerses = 46; // for book

  beforeEach(() => {
    fs.__resetMockFS();
    fs.__setMockFS({}); // initialize to empty
    const sourcePath = path.join(__dirname, 'fixtures/project');
    const destinationPath = path.join(__dirname, 'fixtures/project');
    const copyFiles = ['wordAlignment', 'translationWords'];
    fs.__loadFilesIntoMockFs(copyFiles, sourcePath, destinationPath);

    const sourceResourcesPath = path.join('__tests__', 'fixtures', 'resources');
    const resourcesPath = RESOURCE_PATH;
    const copyResourceFiles = ['grc/bibles/ugnt'];
    fs.__loadFilesIntoMockFs(copyResourceFiles, sourceResourcesPath, resourcesPath);
  });

  test('should get the progress of a partially aligned project - 4 verses out of 46', () => {
    const projectSaveLocation = alignmentToolProject;
    const bookId = 'tit';
    const alignedVerses = 4;
    const pathToWordAlignmentData = path.join(projectSaveLocation, '.apps', 'translationCore', 'alignmentData', bookId);
    const progress = ProjectDetailsHelpers.getWordAlignmentProgress(pathToWordAlignmentData, bookId);
    expect(progress).toEqual(alignedVerses/totalVerses);
  });

  test('should get the progress of a partially aligned project - 3 verses out of 46', () => {
    const projectSaveLocation = alignmentToolProject;
    const bookId = 'tit';
    const alignedVerses = 3;
    const pathToWordAlignmentData = path.join(projectSaveLocation, '.apps', 'translationCore', 'alignmentData', bookId);
    unalignChapter1Verse2(pathToWordAlignmentData);
    const progress = ProjectDetailsHelpers.getWordAlignmentProgress(pathToWordAlignmentData, bookId);
    expect(progress).toEqual(alignedVerses/totalVerses);
  });

  test('should get the progress of a partially aligned project with empty verse - 3 verses out of 46', () => {
    const projectSaveLocation = alignmentToolProject;
    const bookId = 'tit';
    const alignedVerses = 3;
    const pathToWordAlignmentData = path.join(projectSaveLocation, '.apps', 'translationCore', 'alignmentData', bookId);
    emptyChapter1Verse1(pathToWordAlignmentData);
    const progress = ProjectDetailsHelpers.getWordAlignmentProgress(pathToWordAlignmentData, bookId);
    expect(progress).toEqual(alignedVerses/totalVerses);
  });

  test('should get the progress of zero for an unaligned project', () => {
    const projectSaveLocation = emptyAlignmentToolProject;
    const bookId = 'tit';
    const alignedVerses = 0;
    const pathToWordAlignmentData = path.join(projectSaveLocation, '.apps', 'translationCore', 'alignmentData', bookId);
    const progress = ProjectDetailsHelpers.getWordAlignmentProgress(pathToWordAlignmentData, bookId);
    expect(progress).toEqual(alignedVerses/totalVerses);
  });

  test('should get the progress of zero for a new project', () => {
    const projectSaveLocation = emptyAlignmentToolProject;
    const bookId = 'tit';
    const alignedVerses = 0;
    const pathToWordAlignmentData = path.join(projectSaveLocation, '.apps', 'translationCore', 'alignmentData', bookId);
    fs.removeSync(pathToWordAlignmentData);
    const progress = ProjectDetailsHelpers.getWordAlignmentProgress(pathToWordAlignmentData, bookId);
    expect(progress).toEqual(alignedVerses/totalVerses);
  });

  test('should get the progress of 100% for a fully aligned project', () => {
    const projectSaveLocation = alignmentToolProject;
    const bookId = 'tit';
    const alignedVerses = 46;
    const pathToWordAlignmentData = path.join(projectSaveLocation, '.apps', 'translationCore', 'alignmentData', bookId);
    const alignedVerse = getAlignments(pathToWordAlignmentData, 1, 1);
    copyVerseAlignmentsToAllVerses(pathToWordAlignmentData, alignedVerse);
    const progress = ProjectDetailsHelpers.getWordAlignmentProgress(pathToWordAlignmentData, bookId);
    expect(progress).toEqual(alignedVerses/totalVerses);
  });
});

describe('ProjectDetailsHelpers.getToolProgress', () => {
  beforeEach(() => {
    fs.__resetMockFS();
    fs.__setMockFS({}); // initialize to empty
    const sourcePath = path.join(__dirname, 'fixtures/project');
    const destinationPath = path.join(__dirname, 'fixtures/project');
    const copyFiles = ['wordAlignment', 'translationWords'];
    fs.__loadFilesIntoMockFs(copyFiles, sourcePath, destinationPath);

    const sourceResourcesPath = path.join('__tests__', 'fixtures', 'resources');
    const resourcesPath = RESOURCE_PATH;
    const copyResourceFiles = ['grc'];
    fs.__loadFilesIntoMockFs(copyResourceFiles, sourceResourcesPath, resourcesPath);
  });

  test('should get the progress for a non alignment tool', () => {
    let toolName = 'translationWords';
    let bookId = 'tit';
    let userSelectedCategories = ['kt'];
    const pathToCheckDataFiles = path.join(translationWordsProject, INDEX_FOLDER_PATH, toolName, bookId);
    expect(ProjectDetailsHelpers.getToolProgress(pathToCheckDataFiles, toolName, userSelectedCategories, bookId)).toBe(0.05);
  });
});

describe('ProjectDetailsHelpers.getWordAlignmentProgressForGroupIndex', () => {
  const totalVerses = 16; // for chapter 1

  beforeEach(() => {
    fs.__resetMockFS();
    fs.__setMockFS({}); // initialize to empty
    const sourcePath = path.join(__dirname, 'fixtures/project');
    const destinationPath = path.join(__dirname, 'fixtures/project');
    const copyFiles = ['wordAlignment', 'translationWords'];
    fs.__loadFilesIntoMockFs(copyFiles, sourcePath, destinationPath);

    const sourceResourcesPath = path.join('__tests__', 'fixtures', 'resources');
    const resourcesPath = RESOURCE_PATH;
    const copyResourceFiles = ['grc/bibles/ugnt'];
    fs.__loadFilesIntoMockFs(copyResourceFiles, sourceResourcesPath, resourcesPath);
  });

  test('should get the progress of a partially aligned project - 3 verses out of 16', () => {
    const projectSaveLocation = alignmentToolProject;
    const bookId = 'tit';
    const alignedVerses = 3;
    const groupIndex = { id: 'chapter_1' };
    const progress = ProjectDetailsHelpers.getWordAlignmentProgressForGroupIndex(projectSaveLocation, bookId, groupIndex);
    expect(progress).toEqual(alignedVerses/totalVerses);
  });

  test('should get the progress of a partially aligned project with ungenerated verses - 2 verses out of 16', () => {
    const projectSaveLocation = alignmentToolProject;
    const chapter1path = path.join(projectSaveLocation, ".apps/translationCore/alignmentData/tit/1.json");
    const chapter1 = fs.readJSONSync(chapter1path);
    delete chapter1[14];
    delete chapter1[15];
    delete chapter1[16];
    fs.outputJsonSync(chapter1path,chapter1);
    const bookId = 'tit';
    const alignedVerses = 2;
    const groupIndex = { id: 'chapter_1' };
    const progress = ProjectDetailsHelpers.getWordAlignmentProgressForGroupIndex(projectSaveLocation, bookId, groupIndex);
    expect(progress).toEqual(alignedVerses/totalVerses);
  });

  test('should get the progress of a partially aligned project - 2 verses out of 16', () => {
    const projectSaveLocation = alignmentToolProject;
    const bookId = 'tit';
    const alignedVerses = 2;
    const groupIndex = { id: 'chapter_1' };
    const pathToWordAlignmentData = path.join(projectSaveLocation, '.apps', 'translationCore', 'alignmentData', bookId);
    unalignChapter1Verse2(pathToWordAlignmentData);
    const progress = ProjectDetailsHelpers.getWordAlignmentProgressForGroupIndex(projectSaveLocation, bookId, groupIndex);
    expect(progress).toEqual(alignedVerses/totalVerses);
  });

  test('should get the progress of a partially aligned project with empty verse - 2 verses out of 16', () => {
    const projectSaveLocation = alignmentToolProject;
    const bookId = 'tit';
    const alignedVerses = 2;
    const groupIndex = { id: 'chapter_1' };
    const pathToWordAlignmentData = path.join(projectSaveLocation, '.apps', 'translationCore', 'alignmentData', bookId);
    emptyChapter1Verse1(pathToWordAlignmentData);
    const progress = ProjectDetailsHelpers.getWordAlignmentProgressForGroupIndex(projectSaveLocation, bookId, groupIndex);
    expect(progress).toEqual(alignedVerses/totalVerses);
  });

  test('should get the progress of zero for an unaligned project', () => {
    const projectSaveLocation = emptyAlignmentToolProject;
    const bookId = 'tit';
    const alignedVerses = 0;
    const groupIndex = { id: 'chapter_1' };
    const progress = ProjectDetailsHelpers.getWordAlignmentProgressForGroupIndex(projectSaveLocation, bookId, groupIndex);
    expect(progress).toEqual(alignedVerses/totalVerses);
  });

  test('should get the progress of zero for a new project', () => {
    const projectSaveLocation = emptyAlignmentToolProject;
    const bookId = 'tit';
    const alignedVerses = 0;
    const pathToWordAlignmentData = path.join(projectSaveLocation, '.apps', 'translationCore', 'alignmentData', bookId);
    fs.removeSync(pathToWordAlignmentData);
    const groupIndex = { id: 'chapter_1' };
    const progress = ProjectDetailsHelpers.getWordAlignmentProgressForGroupIndex(projectSaveLocation, bookId, groupIndex);
    expect(progress).toEqual(alignedVerses/totalVerses);
  });

  test('should get the progress of 100% for fully aligned chapter 1', () => {
    const projectSaveLocation = alignmentToolProject;
    const bookId = 'tit';
    const alignedVerses = 16;
    const groupIndex = { id: 'chapter_1' };
    const pathToWordAlignmentData = path.join(projectSaveLocation, '.apps', 'translationCore', 'alignmentData', bookId);
    const alignedVerse = getAlignments(pathToWordAlignmentData, 1, 1);
    copyVerseAlignmentsToAllVerses(pathToWordAlignmentData, alignedVerse);
    const progress = ProjectDetailsHelpers.getWordAlignmentProgressForGroupIndex(projectSaveLocation, bookId, groupIndex);
    expect(progress).toEqual(alignedVerses/totalVerses);
  });

  test('should get the progress of 100% for fully aligned chapter 3', () => {
    const projectSaveLocation = alignmentToolProject;
    const bookId = 'tit';
    const alignedVerses = 15;
    const totalVerses = 15; // for chapter 3
    const groupIndex = { id: 'chapter_3' };
    const pathToWordAlignmentData = path.join(projectSaveLocation, '.apps', 'translationCore', 'alignmentData', bookId);
    const alignedVerse = getAlignments(pathToWordAlignmentData, 1, 1);
    copyVerseAlignmentsToAllVerses(pathToWordAlignmentData, alignedVerse);
    const progress = ProjectDetailsHelpers.getWordAlignmentProgressForGroupIndex(projectSaveLocation, bookId, groupIndex);
    expect(progress).toEqual(alignedVerses/totalVerses);
  });
});

describe('ProjectDetailsHelpers.updateProjectFolderName', () => {
  const projectSaveLocation = 'a/project/path';
  const oldSelectedProjectFileName = 'WRONG_BOOK_ABBR';
  const bookID = 'tit';
  const sourcePath = path.join(projectSaveLocation, oldSelectedProjectFileName);
  const destinationPath = path.join(projectSaveLocation, bookID);
  beforeEach(() => {
    // reset mock filesystem data
    fs.__resetMockFS();
  });
  it('should change the project target language name to the new given one', () => {
    fs.__setMockFS({
      [sourcePath]: ['tit', 'manifest', 'LICENSE']
    });
    expect(fs.existsSync(sourcePath)).toBeTruthy();
    expect(fs.existsSync(destinationPath)).toBeFalsy();
    ProjectDetailsHelpers.updateProjectFolderName(bookID, projectSaveLocation, oldSelectedProjectFileName);
    expect(fs.existsSync(sourcePath)).toBeFalsy();
    expect(fs.existsSync(destinationPath)).toBeTruthy();
  });

  it('should not change the project target language name to the new given one if it already exists', () => {
    fs.__setMockFS({
      [destinationPath]: ['tit', 'manifest', 'LICENSE']
    });
    expect(fs.existsSync(sourcePath)).toBeFalsy();
    expect(fs.existsSync(destinationPath)).toBeTruthy();
    ProjectDetailsHelpers.updateProjectFolderName(bookID, projectSaveLocation, oldSelectedProjectFileName);
    expect(fs.existsSync(sourcePath)).toBeFalsy();
    expect(fs.existsSync(destinationPath)).toBeTruthy();
  });
});

describe('ProjectDetailsHelpers.generateNewProjectName', () => {
  const base_manifest = {
    target_language: {
      id: 'fr',
      name: 'francais',
      direction: 'ltr'
    },
    project: {
      id: 'eph',
      name: 'Ephesians'
    },
    resource: {
      id: 'ult',
      name: 'unfoldingWord Literal Text'
    }
  };

  test('generate new project name', () => {
    // given
    const manifest = JSON.parse(JSON.stringify(base_manifest));
    const expectedProjectName = 'fr_ult_eph_book';

    // when
    const projectName = ProjectDetailsHelpers.generateNewProjectName(manifest);

    //then
    expect(projectName).toEqual(expectedProjectName);
  });

  test('generate new project name lowercase', () => {
    // given
    const manifest = JSON.parse(JSON.stringify(base_manifest));
    manifest.resource.id = "ULT";
    const expectedProjectName = 'fr_ult_eph_book';

    // when
    const projectName = ProjectDetailsHelpers.generateNewProjectName(manifest);

    //then
    expect(projectName).toEqual(expectedProjectName);
  });

  test('generate new project name without resource id', () => {
    // given
    const manifest = JSON.parse(JSON.stringify(base_manifest));
    delete manifest.resource.id;
    const expectedProjectName = 'fr_eph_book';

    // when
    const projectName = ProjectDetailsHelpers.generateNewProjectName(manifest);

    //then
    expect(projectName).toEqual(expectedProjectName);
  });

  test('should not crash on empty manifest', () => {
    // given
    const manifest = {};

    // when
    const projectName = ProjectDetailsHelpers.generateNewProjectName(manifest);

    //then
    expect(typeof projectName).toEqual('string');
  });
});

describe('ProjectDetailsHelpers.showDcsRenameFailure', () => {
  const projectPath = path.join('path', 'to', 'project', 'PROJECT_NAME');

  beforeEach(() => {
    mock_alertCallbackButton = 0;
    mock_alertCallbackButtonText = '';
    mock_doOnlineConfirmCallback = false;
  });

  test('on click retry, should call retry', () => {
    const store = mockStore({
      settingsReducer: {}
    });
    const createNew = false;
    mock_alertCallbackButton = 1;
    const expectedClickButton = "buttons.retry";

    store.dispatch(ProjectDetailsHelpers.showDcsRenameFailure(projectPath, createNew));
    expect(store.getActions()).toMatchSnapshot();
    expect(mock_alertCallbackButtonText).toEqual(expectedClickButton);
  });

  test('on click retry, should call continue', () => {
    const store = mockStore({
      settingsReducer: {}
    });
    const createNew = false;
    mock_alertCallbackButton = 2;
    const expectedClickButton = "buttons.continue_button";

    store.dispatch(ProjectDetailsHelpers.showDcsRenameFailure(projectPath, createNew));
    expect(store.getActions()).toMatchSnapshot();
    expect(mock_alertCallbackButtonText).toEqual(expectedClickButton);
  });

  test('on click help desk, should call contactHelpDesk', () => {
    const store = mockStore({
      settingsReducer: {}
    });
    const createNew = false;
    mock_alertCallbackButton = 3;
    const expectedClickButton = "buttons.contact_helpdesk";

    store.dispatch(ProjectDetailsHelpers.showDcsRenameFailure(projectPath, createNew));
    expect(store.getActions()).toMatchSnapshot();
    expect(mock_alertCallbackButtonText).toEqual(expectedClickButton);
  });
});

describe('ProjectDetailsHelpers.doDcsRenamePrompting', () => {
  const projectPath = path.join('path', 'to', 'project', 'PROJECT_NAME');

  beforeEach(() => {
    mock_alertCallbackButton = 0;
    mock_alertCallbackButtonText = '';
    mock_doOnlineConfirmCallback = false;
  });

  test('on click rename, should call rename', async () => {
    const store = mockStore({
      projectDetailsReducer: {projectSaveLocation: projectPath},
      loginReducer: {
        loggedInUser: false,
        userdata: {
          username: 'dummy-test'
        },
        feedback: '',
        subject: 'Bug Report',
        placeholder: 'Leave us your feedback!'
      }
    });
    mock_alertCallbackButton = 1;
    const expectedClickButton = "buttons.rename_repo";

    await store.dispatch(ProjectDetailsHelpers.doDcsRenamePrompting());
    expect(store.getActions()).toMatchSnapshot();
    expect(mock_alertCallbackButtonText).toEqual(expectedClickButton);
  });

  test('on click create, should call create new', async () => {
    const store = mockStore({
      projectDetailsReducer: {projectSaveLocation: projectPath},
      loginReducer: {
        loggedInUser: false,
        userdata: {
          username: 'dummy-test'
        },
        feedback: '',
        subject: 'Bug Report',
        placeholder: 'Leave us your feedback!'
      }
    });
    mock_alertCallbackButton = 2;
    const expectedClickButton = "buttons.create_new_repo";

    await store.dispatch(ProjectDetailsHelpers.doDcsRenamePrompting());
    expect(store.getActions()).toMatchSnapshot();
    expect(mock_alertCallbackButtonText).toEqual(expectedClickButton);
  });
});

describe('ProjectDetailsHelpers.handleDcsOperation', () => {
  const projectPath = path.join('path', 'to', 'project', 'PROJECT_NAME');

  beforeEach(() => {
    mock_alertCallbackButton = 0;
    mock_alertCallbackButtonText = '';
    mock_repoExists = false;
    mock_doOnlineConfirmCallback = true;
    mock_renameRepoCallCount = 0;
    mock_createNewRepoCallCount = 0;
  });

  test('should handle repo exists', async () => {
    const store = mockStore({
      projectDetailsReducer: {projectSaveLocation: projectPath},
      loginReducer: {
        loggedInUser: false,
        userdata: {
          username: 'dummy-test'
        },
        feedback: '',
        subject: 'Bug Report',
        placeholder: 'Leave us your feedback!'
      },
      settingsReducer: {
        onlineMode: true
      }
    });
    const createNew = false;
    mock_repoExists = true;

    await store.dispatch(ProjectDetailsHelpers.handleDcsOperation(createNew, projectPath));
    expect(store.getActions()).toMatchSnapshot();
    expect(mock_renameRepoCallCount).toEqual(0);
    expect(mock_createNewRepoCallCount).toEqual(0);
  });

  test('on repo does not exist, should call create new', async () => {
    const store = mockStore({
      projectDetailsReducer: {projectSaveLocation: projectPath},
      loginReducer: {
        loggedInUser: false,
        userdata: {
          username: 'dummy-test'
        },
        feedback: '',
        subject: 'Bug Report',
        placeholder: 'Leave us your feedback!'
      },
      settingsReducer: {
        onlineMode: true
      }
    });
    const createNew = true;

    await store.dispatch(ProjectDetailsHelpers.handleDcsOperation(createNew, projectPath));
    expect(store.getActions()).toMatchSnapshot();
    expect(mock_renameRepoCallCount).toEqual(0);
    expect(mock_createNewRepoCallCount).toEqual(1);
  });

  test('on repo does not exist, should call rename', async () => {
    const store = mockStore({
      projectDetailsReducer: {projectSaveLocation: projectPath},
      loginReducer: {
        loggedInUser: false,
        userdata: {
          username: 'dummy-test'
        },
        feedback: '',
        subject: 'Bug Report',
        placeholder: 'Leave us your feedback!'
      },
      settingsReducer: {
        onlineMode: true
      }
    });
    const createNew = false;

    await store.dispatch(ProjectDetailsHelpers.handleDcsOperation(createNew, projectPath));
    expect(store.getActions()).toMatchSnapshot();
    expect(mock_renameRepoCallCount).toEqual(1);
    expect(mock_createNewRepoCallCount).toEqual(0);
  });
});

describe('ProjectDetailsHelpers.handleDcsRenameCollision', () => {
  const projectPath = path.join('path', 'to', 'project', 'PROJECT_NAME');

  beforeEach(() => {
    mock_alertCallbackButton = 0;
    mock_alertCallbackButtonText = '';
    mock_doOnlineConfirmCallback = false;
  });

  test('on click rename, should render and open project details', async () => {
    const store = mockStore({
      projectDetailsReducer: {projectSaveLocation: projectPath},
      loginReducer: {
        loggedInUser: false,
        userdata: {
          username: 'dummy-test'
        },
        feedback: '',
        subject: 'Bug Report',
        placeholder: 'Leave us your feedback!'
      },
      projectInformationCheckReducer: {
        alreadyImported: true,
        overwritePermitted: false,
      }
    });
    mock_alertCallbackButton = 1;
    const expectedClickButton = "buttons.rename_local";

    await store.dispatch(ProjectDetailsHelpers.handleDcsRenameCollision());
    expect(store.getActions()).toMatchSnapshot();
    expect(mock_alertCallbackButtonText).toEqual(expectedClickButton);
  });

  test('on click continue, should do nothing', async () => {
    const store = mockStore({
      projectDetailsReducer: {projectSaveLocation: projectPath},
      loginReducer: {
        loggedInUser: false,
        userdata: {
          username: 'dummy-test'
        },
        feedback: '',
        subject: 'Bug Report',
        placeholder: 'Leave us your feedback!'
      }
    });
    mock_alertCallbackButton = 2;
    const expectedClickButton = "buttons.do_not_rename";

    await store.dispatch(ProjectDetailsHelpers.handleDcsRenameCollision());
    expect(store.getActions()).toMatchSnapshot();
    expect(mock_alertCallbackButtonText).toEqual(expectedClickButton);
  });
});

describe('ProjectDetailsHelpers.doesDcsProjectNameAlreadyExist', () => {

  beforeEach(() => {
    mock_repoExists = false;
    mock_repoError = false;
  });

  test('repo exists should succeed', async () => {
    mock_repoExists = true;

    let results = await ProjectDetailsHelpers.doesDcsProjectNameAlreadyExist(null, null);
    expect(results).toEqual(mock_repoExists);
  });

  test('repo does not exist should succeed', async () => {
    mock_repoExists = false;

    let results = await ProjectDetailsHelpers.doesDcsProjectNameAlreadyExist(null, null);
    expect(results).toEqual(mock_repoExists);
  });

  test('repo error should handle gracefully', async () => {
    mock_repoError = true;

    await ProjectDetailsHelpers.doesDcsProjectNameAlreadyExist(null, null).catch((e) => {
      expect(e).toBeTruthy();
    });
  });

});

describe('ProjectDetailsHelpers.getDetailsFromProjectName', () => {
  test('null project name should not crash', () => {
    const projectName = null;
    const expectedResults = {"bookId": "", "bookName": "", "languageId": ""};

    let results = ProjectDetailsHelpers.getDetailsFromProjectName(projectName);
    expect(results).toEqual(expectedResults);
  });

  test('empty project name should not crash', () => {
    const projectName = "";
    const expectedResults = {"bookId": "", "bookName": "", "languageId": ""};

    let results = ProjectDetailsHelpers.getDetailsFromProjectName(projectName);
    expect(results).toEqual(expectedResults);
  });

  test('short name should succeed', () => {
    const projectName = "en_tit";
    const expectedResults = {"bookId": "tit", "bookName": "Titus", "languageId": "en"};

    let results = ProjectDetailsHelpers.getDetailsFromProjectName(projectName);
    expect(results).toEqual(expectedResults);
  });

  test('old tStudio format name should succeed', () => {
    const projectName = "aaw_php_text_reg";
    const expectedResults = {"bookId": "php", "bookName": "Philippians", "languageId": "aaw"};

    let results = ProjectDetailsHelpers.getDetailsFromProjectName(projectName);
    expect(results).toEqual(expectedResults);
  });

  test('new format name should succeed', () => {
    const projectName = "el_ult_tit_book";
    const expectedResults = {"bookId": "tit", "bookName": "Titus", "languageId": "el"};

    let results = ProjectDetailsHelpers.getDetailsFromProjectName(projectName);
    expect(results).toEqual(expectedResults);
  });
});

describe('ProjectDetailsHelpers.getInitialBibleDataFolderName', () => {
  const bookId = "php";
  const projectFilename = "en_php";
  const initialBibleDataFolderName = "php";
  const IMPORTS_PATH = path.join(ospath.home(), 'translationCore', 'imports');
  const projectPath = path.join (IMPORTS_PATH, projectFilename);
  const projectBibleDataPath = path.join (projectPath, initialBibleDataFolderName);
  const manifest_ = {
    project: {
      id: bookId
    }
  };

  beforeEach(() => {
    fs.__resetMockFS();
    fs.ensureDirSync(projectBibleDataPath);
  });

  test('if project.id present in manifest.json and folder present, it should be returned', () => {
    const expectedResults = bookId;
    fs.outputJsonSync(path.join(projectPath, 'manifest.json'), manifest_);
    let results = ProjectDetailsHelpers.getInitialBibleDataFolderName(projectFilename, projectPath);
    expect(results).toEqual(expectedResults);
  });

  test('if project.id is not present in manifest.json, it should return projectFilename', () => {
    const expectedResults = projectFilename;
    const manifest = JSON.parse(JSON.stringify(manifest_));
    delete manifest.project.id;
    fs.outputJsonSync(path.join(projectPath, 'manifest.json'), manifest);
    let results = ProjectDetailsHelpers.getInitialBibleDataFolderName(projectFilename, projectBibleDataPath);
    expect(results).toEqual(expectedResults);
  });

  test('if project is not present in manifest.json, it should return projectFilename', () => {
    const expectedResults = projectFilename;
    const manifest = JSON.parse(JSON.stringify(manifest_));
    fs.outputJsonSync(path.join(projectPath, 'manifest.json'), manifest);
    delete manifest.project;
    let results = ProjectDetailsHelpers.getInitialBibleDataFolderName(projectFilename, projectBibleDataPath);
    expect(results).toEqual(expectedResults);
  });

  test('if manifest.json is not present, it should return projectFilename', () => {
    const expectedResults = projectFilename;
    let results = ProjectDetailsHelpers.getInitialBibleDataFolderName(projectFilename, projectBibleDataPath);
    expect(results).toEqual(expectedResults);
  });
});

describe('ProjectDetailsHelpers.fixBibleDataFolderName', () => {
  const bookId = "php";
  const projectFilename = "en_php";
  const initialBibleDataFolderName = "php";
  const IMPORTS_PATH = path.join(ospath.home(), 'translationCore', 'imports');
  const projectPath = path.join (IMPORTS_PATH, projectFilename);
  const projectBibleDataPath = path.join (projectPath, initialBibleDataFolderName);
  const manifest_ = {
    project: {
      id: bookId
    }
  };

  beforeEach(() => {
    fs.__resetMockFS();
    fs.ensureDirSync(projectBibleDataPath);
  });

  test('if manifest.project.id unchanged, it should not move file', () => {
    const expectedPath = projectBibleDataPath;
    ProjectDetailsHelpers.fixBibleDataFolderName(manifest_, initialBibleDataFolderName, projectPath);
    expect(fs.existsSync(expectedPath)).toBeTruthy();
  });

  test('if manifest.project.id changed, it should move file', () => {
    const newProjectId = "gal";
    const expectedPath = path.join (projectPath, newProjectId);
    const manifest = JSON.parse(JSON.stringify(manifest_));
    manifest.project.id = newProjectId;
    ProjectDetailsHelpers.fixBibleDataFolderName(manifest, initialBibleDataFolderName, projectPath);
    expect(fs.existsSync(expectedPath)).toBeTruthy();
  });

  test('if manifest.project.id is missing, it should not move file', () => {
    const expectedPath = projectBibleDataPath;
    const manifest = JSON.parse(JSON.stringify(manifest_));
    delete manifest.project.id;
    ProjectDetailsHelpers.fixBibleDataFolderName(manifest, initialBibleDataFolderName, projectPath);
    expect(fs.existsSync(expectedPath)).toBeTruthy();
  });

  test('if manifest.project is missing, it should not move file', () => {
    const expectedPath = projectBibleDataPath;
    const manifest = JSON.parse(JSON.stringify(manifest_));
    delete manifest.project;
    ProjectDetailsHelpers.fixBibleDataFolderName(manifest, initialBibleDataFolderName, projectPath);
    expect(fs.existsSync(expectedPath)).toBeTruthy();
  });

  test('if manifest is empty, it should not move file', () => {
    const expectedPath = projectBibleDataPath;
    const manifest = {};
    ProjectDetailsHelpers.fixBibleDataFolderName(manifest, initialBibleDataFolderName, projectPath);
    expect(fs.existsSync(expectedPath)).toBeTruthy();
  });

  test('if manifest is null, it should not move file', () => {
    const expectedPath = projectBibleDataPath;
    const manifest = null;
    ProjectDetailsHelpers.fixBibleDataFolderName(manifest, initialBibleDataFolderName, projectPath);
    expect(fs.existsSync(expectedPath)).toBeTruthy();
  });
});

//
// helpers
//

function unalignChapter1Verse2(pathToWordAlignmentData) {
  const chapter1_path = path.join(pathToWordAlignmentData, "1.json");
  const chapter1 = fs.readJSONSync(chapter1_path);
  chapter1[2] = chapter1[3]; // make 2nd verse unaligned
  fs.outputJsonSync(chapter1_path, chapter1);
}

function emptyChapter1Verse1(pathToWordAlignmentData) {
  const chapter1_path = path.join(pathToWordAlignmentData, "1.json");
  const chapter1 = fs.readJSONSync(chapter1_path);
  const verse1Alignments = chapter1[1].alignments;
  Object.keys(verse1Alignments).forEach(key => {
    const item = verse1Alignments[key];
    item.bottomWords = [];
  });
  fs.outputJsonSync(chapter1_path, chapter1);
}

function getAlignments(pathToWordAlignmentData, chapter, verse) {
  const chapter_path = path.join(pathToWordAlignmentData, chapter + ".json");
  const chapter_data = fs.readJSONSync(chapter_path);
  return JSON.parse(JSON.stringify(chapter_data[verse]));
}

function copyVerseAlignmentsToAllVerses(pathToWordAlignmentData, alignments) {
  for (let i = 1; i <= 3; i++) {
    const chapter_path = path.join(pathToWordAlignmentData, i + ".json");
    const chapter_data = fs.readJSONSync(chapter_path);
    for (let verse of Object.keys(chapter_data)) {
      chapter_data[verse] = alignments;
    }
    fs.outputJsonSync(chapter_path, chapter_data);
  }
}
