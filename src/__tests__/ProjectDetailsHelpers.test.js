/* eslint-env jest */
import path from 'path-extra';
import fs from 'fs-extra';
//helpers
import * as ProjectDetailsHelpers from '../js/helpers/ProjectDetailsHelpers';
// constants
import {
  USER_RESOURCES_PATH,
  PROJECT_INDEX_FOLDER_PATH,
  IMPORTS_PATH,
  WORD_ALIGNMENT,
  TRANSLATION_WORDS,
} from '../js/common/constants';
jest.mock('../js/helpers/Repo');
jest.mock('material-ui/Checkbox');

//projects
const alignmentToolProject = path.join(__dirname, 'fixtures/project/wordAlignment/normal_project');
const emptyAlignmentToolProject = path.join(__dirname, 'fixtures/project/wordAlignment/empty_project');
const translationWordsProject = path.join(__dirname, 'fixtures/project/translationWords/normal_project');

let mock_repoExists = false;
let mock_repoError = false;

jest.mock('../js/helpers/GogsApiHelpers', () => ({
  ...require.requireActual('../js/helpers/GogsApiHelpers'),
  changeGitToPointToNewRepo: () => new Promise((resolve) => {
    resolve();
  }),
  findRepo: () => new Promise((resolve, reject) => {
    if (mock_repoError) {
      reject('error');
    } else {
      resolve(mock_repoExists);
    }
  }),
}));

describe('ProjectDetailsHelpers.getWordAlignmentProgress', () => {
  const totalVerses = 46; // for book

  beforeEach(() => {
    fs.__resetMockFS();
    fs.__setMockFS({}); // initialize to empty
    const sourcePath = path.join(__dirname, 'fixtures/project');
    const destinationPath = path.join(__dirname, 'fixtures/project');
    const copyFiles = [WORD_ALIGNMENT, TRANSLATION_WORDS];
    fs.__loadFilesIntoMockFs(copyFiles, sourcePath, destinationPath);

    const sourceResourcesPath = path.join('src', '__tests__', 'fixtures', 'resources');
    const resourcesPath = USER_RESOURCES_PATH;
    const copyResourceFiles = ['el-x-koine/bibles/ugnt'];
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
    const copyFiles = [WORD_ALIGNMENT, TRANSLATION_WORDS];
    fs.__loadFilesIntoMockFs(copyFiles, sourcePath, destinationPath);

    const sourceResourcesPath = path.join('src', '__tests__', 'fixtures', 'resources');
    const resourcesPath = USER_RESOURCES_PATH;
    const copyResourceFiles = ['el-x-koine'];
    fs.__loadFilesIntoMockFs(copyResourceFiles, sourceResourcesPath, resourcesPath);
  });

  test('should get the progress for a non alignment tool', () => {
    let toolName = TRANSLATION_WORDS;
    let bookId = 'tit';
    let userSelectedCategories = ['apostle', 'authority', 'clean'];
    const pathToCheckDataFiles = path.join(translationWordsProject, PROJECT_INDEX_FOLDER_PATH, toolName, bookId);
    expect(ProjectDetailsHelpers.getToolProgress(pathToCheckDataFiles, toolName, userSelectedCategories, bookId)).toBe(0.25);
  });
});

describe('ProjectDetailsHelpers.getWordAlignmentProgressForGroupIndex', () => {
  const totalVerses = 16; // for chapter 1

  beforeEach(() => {
    fs.__resetMockFS();
    fs.__setMockFS({}); // initialize to empty
    const sourcePath = path.join(__dirname, 'fixtures/project');
    const destinationPath = path.join(__dirname, 'fixtures/project');
    const copyFiles = [WORD_ALIGNMENT, TRANSLATION_WORDS];
    fs.__loadFilesIntoMockFs(copyFiles, sourcePath, destinationPath);

    const sourceResourcesPath = path.join('src', '__tests__', 'fixtures', 'resources');
    const resourcesPath = USER_RESOURCES_PATH;
    const copyResourceFiles = ['el-x-koine/bibles/ugnt'];
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
    const chapter1path = path.join(projectSaveLocation, '.apps/translationCore/alignmentData/tit/1.json');
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
    fs.__setMockFS({ [sourcePath]: ['tit', 'manifest', 'LICENSE'] });
    expect(fs.existsSync(sourcePath)).toBeTruthy();
    expect(fs.existsSync(destinationPath)).toBeFalsy();
    ProjectDetailsHelpers.updateProjectFolderName(bookID, projectSaveLocation, oldSelectedProjectFileName);
    expect(fs.existsSync(sourcePath)).toBeFalsy();
    expect(fs.existsSync(destinationPath)).toBeTruthy();
  });

  it('should not change the project target language name to the new given one if it already exists', () => {
    fs.__setMockFS({ [destinationPath]: ['tit', 'manifest', 'LICENSE'] });
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
      direction: 'ltr',
    },
    project: {
      id: 'eph',
      name: 'Ephesians',
    },
    resource: {
      id: 'ult',
      name: 'unfoldingWord Literal Text',
    },
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
    manifest.resource.id = 'ULT';
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

describe('ProjectDetailsHelpers.getDetailsFromProjectName', () => {
  test('null project name should not crash', () => {
    const projectName = null;
    const expectedResults = {
      'bookId': '', 'bookName': '', 'languageId': '',
    };

    let results = ProjectDetailsHelpers.getDetailsFromProjectName(projectName);
    expect(results).toEqual(expectedResults);
  });

  test('empty project name should not crash', () => {
    const projectName = '';
    const expectedResults = {
      'bookId': '', 'bookName': '', 'languageId': '',
    };

    let results = ProjectDetailsHelpers.getDetailsFromProjectName(projectName);
    expect(results).toEqual(expectedResults);
  });

  test('short name should succeed', () => {
    const projectName = 'en_tit';
    const expectedResults = {
      'bookId': 'tit', 'bookName': 'book_list.nt.tit', 'languageId': 'en',
    };

    let results = ProjectDetailsHelpers.getDetailsFromProjectName(projectName);
    expect(results).toEqual(expectedResults);
  });

  test('old tStudio format name should succeed', () => {
    const projectName = 'aaw_php_text_reg';
    const expectedResults = {
      'bookId': 'php', 'bookName': 'book_list.nt.php', 'languageId': 'aaw',
    };

    let results = ProjectDetailsHelpers.getDetailsFromProjectName(projectName);
    expect(results).toEqual(expectedResults);
  });

  test('new format name should succeed', () => {
    const projectName = 'el_ult_tit_book';
    const expectedResults = {
      'bookId': 'tit', 'bookName': 'book_list.nt.tit', 'languageId': 'el',
    };

    let results = ProjectDetailsHelpers.getDetailsFromProjectName(projectName);
    expect(results).toEqual(expectedResults);
  });
});

describe('ProjectDetailsHelpers.getInitialBibleDataFolderName', () => {
  const bookId = 'php';
  const projectFilename = 'en_php';
  const initialBibleDataFolderName = 'php';
  const projectPath = path.join (IMPORTS_PATH, projectFilename);
  const projectBibleDataPath = path.join (projectPath, initialBibleDataFolderName);
  const manifest_ = { project: { id: bookId } };

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
  const bookId = 'php';
  const projectFilename = 'en_php';
  const initialBibleDataFolderName = 'php';
  const projectPath = path.join (IMPORTS_PATH, projectFilename);
  const projectBibleDataPath = path.join (projectPath, initialBibleDataFolderName);
  const manifest_ = { project: { id: bookId } };

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
    const newProjectId = 'gal';
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

describe('doesDcsProjectNameAlreadyExist', () => {
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

//
// helpers
//

function unalignChapter1Verse2(pathToWordAlignmentData) {
  const chapter1_path = path.join(pathToWordAlignmentData, '1.json');
  const chapter1 = fs.readJSONSync(chapter1_path);
  chapter1[2] = chapter1[3]; // make 2nd verse unaligned
  fs.outputJsonSync(chapter1_path, chapter1);
}

function emptyChapter1Verse1(pathToWordAlignmentData) {
  const chapter1_path = path.join(pathToWordAlignmentData, '1.json');
  const chapter1 = fs.readJSONSync(chapter1_path);
  const verse1Alignments = chapter1[1].alignments;

  Object.keys(verse1Alignments).forEach(key => {
    const item = verse1Alignments[key];
    item.bottomWords = [];
  });
  fs.outputJsonSync(chapter1_path, chapter1);
}

function getAlignments(pathToWordAlignmentData, chapter, verse) {
  const chapter_path = path.join(pathToWordAlignmentData, chapter + '.json');
  const chapter_data = fs.readJSONSync(chapter_path);
  return JSON.parse(JSON.stringify(chapter_data[verse]));
}

function copyVerseAlignmentsToAllVerses(pathToWordAlignmentData, alignments) {
  for (let i = 1; i <= 3; i++) {
    const chapter_path = path.join(pathToWordAlignmentData, i + '.json');
    const chapter_data = fs.readJSONSync(chapter_path);

    for (let verse of Object.keys(chapter_data)) {
      chapter_data[verse] = alignments;
    }
    fs.outputJsonSync(chapter_path, chapter_data);
  }
}
