/* eslint-env jest */
import path from 'path-extra';
import ospath from 'ospath';
import fs from 'fs-extra';
//helpers
import * as ProjectDetailsHelpers from '../src/js/helpers/ProjectDetailsHelpers';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

//projects
const alignmentToolProject = '__tests__/fixtures/project/wordAlignment/normal_project';
const emptyAlignmentToolProject = '__tests__/fixtures/project/wordAlignment/empty_project';
const translationWordsProject = '__tests__/fixtures/project/translationWords/normal_project';
const INDEX_FOLDER_PATH = path.join('.apps', 'translationCore', 'index');
const RESOURCE_PATH = path.join(ospath.home(), 'translationCore', 'resources');
const PROJECTS_PATH = path.join(ospath.home(), 'translationCore', 'projects');


describe('ProjectDetailsHelpers.getWordAlignmentProgress', () => {
  const totalVerses = 46; // for book

  beforeEach(() => {
    fs.__resetMockFS();
    fs.__setMockFS({}); // initialize to empty
    const sourcePath = '__tests__/fixtures/project/';
    const destinationPath = '__tests__/fixtures/project/';
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
    const sourcePath = '__tests__/fixtures/project/';
    const destinationPath = '__tests__/fixtures/project/';
    const copyFiles = ['wordAlignment', 'translationWords'];
    fs.__loadFilesIntoMockFs(copyFiles, sourcePath, destinationPath);

    const sourceResourcesPath = path.join('__tests__', 'fixtures', 'resources');
    const resourcesPath = RESOURCE_PATH;
    const copyResourceFiles = ['grc/bibles/ugnt'];
    fs.__loadFilesIntoMockFs(copyResourceFiles, sourceResourcesPath, resourcesPath);
  });

  test('should get the progress for a non alignment tool', () => {
    let toolName = 'translationWords';
    let bookId = 'tit';
    const pathToCheckDataFiles = path.join(translationWordsProject, INDEX_FOLDER_PATH, toolName, bookId);
    expect(ProjectDetailsHelpers.getToolProgress(pathToCheckDataFiles)).toBe(0.06);
  });
});

describe('ProjectDetailsHelpers.getWordAlignmentProgressForGroupIndex', () => {
  const totalVerses = 16; // for chapter 1

  beforeEach(() => {
    fs.__resetMockFS();
    fs.__setMockFS({}); // initialize to empty
    const sourcePath = '__tests__/fixtures/project/';
    const destinationPath = '__tests__/fixtures/project/';
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

describe('ProjectDetailsHelpers.updateProjectTargetLanguageBookFolderName', () => {
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
    ProjectDetailsHelpers.updateProjectTargetLanguageBookFolderName(bookID, projectSaveLocation, oldSelectedProjectFileName);
    expect(fs.existsSync(sourcePath)).toBeFalsy();
    expect(fs.existsSync(destinationPath)).toBeTruthy();
  });

  it('should not change the project target language name to the new given one if it already exists', () => {
    fs.__setMockFS({
      [destinationPath]: ['tit', 'manifest', 'LICENSE']
    });
    expect(fs.existsSync(sourcePath)).toBeFalsy();
    expect(fs.existsSync(destinationPath)).toBeTruthy();
    ProjectDetailsHelpers.updateProjectTargetLanguageBookFolderName(bookID, projectSaveLocation, oldSelectedProjectFileName);
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

describe('ProjectDetailsHelpers.updateProjectNameIfNecessary()', () => {
  const currentProjectName = "fr_ult_eph_book";
  const currentProjectPath = path.join(PROJECTS_PATH, currentProjectName);
  const mockStoreData = {
    projectDetailsReducer: {
      manifest: {
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
      },
      projectSaveLocation: currentProjectPath
    },
    localImportReducer: {
      selectedProjectFilename: 'SELECTED_PROJECT_NAME'
    }
  };

  beforeEach(() => {
    // reset mock filesystem data
    fs.__resetMockFS();
    // Set up mock filesystem before each test
    fs.__setMockFS({
      [currentProjectPath]: ''
    });
  });

  afterEach(() => {
    // reset mock filesystem data
    fs.__resetMockFS();
  });

  test('does nothing if project name is valid', async () => {
    // given
    const store = mockStore(mockStoreData);

    // when
    await store.dispatch(ProjectDetailsHelpers.updateProjectNameIfNecessary());

    // then
    expect(cleanupPaths(store.getActions())).toMatchSnapshot();
    expect(fs.pathExistsSync(currentProjectPath)).toBeTruthy();
  });

  test('does nothing if projectSaveLocation is not set', async () => {
    // given
    const storeData = JSON.parse(JSON.stringify(mockStoreData));
    delete storeData.projectDetailsReducer.projectSaveLocation;
    const store = mockStore(storeData);

    // when
    await store.dispatch(ProjectDetailsHelpers.updateProjectNameIfNecessary());

    // then
    expect(cleanupPaths(store.getActions())).toMatchSnapshot();
    expect(fs.pathExistsSync(currentProjectPath)).toBeTruthy();
  });

  test('renames project if lang_id changed', async () => {
    // given
    const newProjectName = "am_ult_eph_book";
    const expectedProjectPath = path.join(PROJECTS_PATH, newProjectName);
    const storeData = JSON.parse(JSON.stringify(mockStoreData));
    storeData.projectDetailsReducer.manifest.target_language.id = 'am';
    const store = mockStore(storeData);

    // when
    await store.dispatch(ProjectDetailsHelpers.updateProjectNameIfNecessary());

    // then
    expect(cleanupPaths(store.getActions())).toMatchSnapshot();
    expect(fs.pathExistsSync(currentProjectPath)).not.toBeTruthy();
    expect(fs.pathExistsSync(expectedProjectPath)).toBeTruthy();
  });

  test('renames project if project id changed', async () => {
    // given
    const newProjectName = "fr_ult_tit_book";
    const expectedProjectPath = path.join(PROJECTS_PATH, newProjectName);
    const storeData = JSON.parse(JSON.stringify(mockStoreData));
    storeData.projectDetailsReducer.manifest.project.id = 'tit';
    const store = mockStore(storeData);

    // when
    await store.dispatch(ProjectDetailsHelpers.updateProjectNameIfNecessary());

    // then
    expect(cleanupPaths(store.getActions())).toMatchSnapshot();
    expect(fs.pathExistsSync(currentProjectPath)).not.toBeTruthy();
    expect(fs.pathExistsSync(expectedProjectPath)).toBeTruthy();
  });

  test('renames project if resource.id (resourceId) changed', async () => {
    // given
    const newProjectName = "fr_lib_eph_book";
    const expectedProjectPath = path.join(PROJECTS_PATH, newProjectName);
    const storeData = JSON.parse(JSON.stringify(mockStoreData));
    storeData.projectDetailsReducer.manifest.resource.id = 'lib';
    const store = mockStore(storeData);

    // when
    await store.dispatch(ProjectDetailsHelpers.updateProjectNameIfNecessary());

    // then
    expect(cleanupPaths(store.getActions())).toMatchSnapshot();
    expect(fs.pathExistsSync(currentProjectPath)).not.toBeTruthy();
    expect(fs.pathExistsSync(expectedProjectPath)).toBeTruthy();
  });

  test('renames project if new project name is different than spec', async () => {
    // given
    const currentProjectPath = path.join(PROJECTS_PATH, "fr_ULT_eph_book");
    const newProjectName = "fr_ult_eph_book";
    const expectedProjectPath = path.join(PROJECTS_PATH, newProjectName);
    fs.moveSync(expectedProjectPath, currentProjectPath); // move to invalid file
    const storeData = JSON.parse(JSON.stringify(mockStoreData));
    storeData.projectDetailsReducer.projectSaveLocation = currentProjectPath;
    const store = mockStore(storeData);

    // when
    await store.dispatch(ProjectDetailsHelpers.updateProjectNameIfNecessary());

    // then
    expect(cleanupPaths(store.getActions())).toMatchSnapshot();
    expect(fs.pathExistsSync(currentProjectPath)).not.toBeTruthy();
    expect(fs.pathExistsSync(expectedProjectPath)).toBeTruthy();
  });

  test('does not rename project if new project name is different than spec and we have duplicate', async () => {
    // given
    const currentProjectPath = path.join(PROJECTS_PATH, "fr_ULT_eph_book");
    const newProjectName = "fr_ult_eph_book";
    const expectedProjectPath = path.join(PROJECTS_PATH, newProjectName);
    fs.moveSync(expectedProjectPath, currentProjectPath); // move to invalid file
    fs.copySync(currentProjectPath, expectedProjectPath); // make duplicate
    const storeData = JSON.parse(JSON.stringify(mockStoreData));
    storeData.projectDetailsReducer.projectSaveLocation = currentProjectPath;
    const store = mockStore(storeData);

    // when
    await store.dispatch(ProjectDetailsHelpers.updateProjectNameIfNecessary());

    // then
    expect(cleanupPaths(store.getActions())).toMatchSnapshot();
    expect(fs.pathExistsSync(currentProjectPath)).toBeTruthy();
    expect(fs.pathExistsSync(expectedProjectPath)).toBeTruthy();
  });
});

//
// helpers
//

/**
 * remove user specific paths and just get basename
 * @param {Array} actions
 * @return {*}
 */
function cleanupPaths(actions) {
  if (actions && actions.length) {
    for (let action of actions) {
      if ('pathLocation' in action) {
        action.pathLocation = path.basename(action.pathLocation);
      }
    }
  }
  return actions;
}

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
