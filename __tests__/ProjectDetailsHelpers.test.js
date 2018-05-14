/* eslint-env jest */
import path from 'path-extra';
import ospath from 'ospath';
import fs from 'fs-extra';
//helpers
import * as ProjectDetailsHelpers from '../src/js/helpers/ProjectDetailsHelpers';
//projects
const alignmentToolProject = '__tests__/fixtures/project/wordAlignment/normal_project';
const emptyAlignmentToolProject = '__tests__/fixtures/project/wordAlignment/empty_project';
const translationWordsProject = '__tests__/fixtures/project/translationWords/normal_project';
const INDEX_FOLDER_PATH = path.join('.apps', 'translationCore', 'index');
const RESOURCE_PATH = path.join(ospath.home(), 'translationCore', 'resources');


describe('ProjectDetailsHelpers.getWordAlignmentProgress', () => {
  const totalVerses = 46; // for book

  beforeAll(() => {
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
});

describe('ProjectDetailsHelpers.getToolProgress', () => {
  test('should get the progress for a non alignment tool', () => {
    let toolName = 'translationWords';
    let bookId = 'tit';
    const pathToCheckDataFiles = path.join(translationWordsProject, INDEX_FOLDER_PATH, toolName, bookId);
    expect(ProjectDetailsHelpers.getToolProgress(pathToCheckDataFiles)).toBe(0.06);
  });
});

describe('ProjectDetailsHelpers.getWordAlignmentProgressForGroupIndex', () => {
  const totalVerses = 16; // for chapter 1

  beforeAll(() => {
    const sourcePath = '__tests__/fixtures/project/';
    const destinationPath = '__tests__/fixtures/project/';
    const copyFiles = ['wordAlignment', 'translationWords'];
    fs.__loadFilesIntoMockFs(copyFiles, sourcePath, destinationPath);

    const sourceResourcesPath = path.join('__tests__', 'fixtures', 'resources');
    const resourcesPath = RESOURCE_PATH;
    const copyResourceFiles = ['grc/bibles/ugnt'];
    fs.__loadFilesIntoMockFs(copyResourceFiles, sourceResourcesPath, resourcesPath);
  });

  test('should get the progress of a partially aligned project - 3 verses', () => {
    const projectSaveLocation = alignmentToolProject;
    const bookId = 'tit';
    const alignedVerses = 3;
    const groupIndex = { id: 'chapter_1' };
    const progress = ProjectDetailsHelpers.getWordAlignmentProgressForGroupIndex(projectSaveLocation, bookId, groupIndex);
    expect(progress).toEqual(alignedVerses/totalVerses);
  });

  test('should get the progress of a partially aligned project - 2 verses', () => {
    const projectSaveLocation = alignmentToolProject;
    const bookId = 'tit';
    const alignedVerses = 2;
    const groupIndex = { id: 'chapter_1' };
    const pathToWordAlignmentData = path.join(projectSaveLocation, '.apps', 'translationCore', 'alignmentData', bookId);
    unalignChapter1Verse2(pathToWordAlignmentData);
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
});

describe('ProjectValidationActions.updateProjectTargetLanguageBookFolderName', () => {
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

//
// helpers
//

function unalignChapter1Verse2(pathToWordAlignmentData) {
  const chapter1_path = path.join(pathToWordAlignmentData, "1.json");
  const chapter1 = fs.readJSONSync(chapter1_path);
  chapter1[2] = chapter1[3]; // make 2nd verse unaligned
  fs.outputJsonSync(chapter1_path, chapter1);
}

