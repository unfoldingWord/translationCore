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

  test('should get the progress of a word alignment project', () => {
    let projectSaveLocation = alignmentToolProject;
    let bookId = 'tit';
    const pathToWordAlignmentData = path.join(projectSaveLocation, '.apps', 'translationCore', 'alignmentData', bookId);
    let progress = ProjectDetailsHelpers.getWordAlignmentProgress(pathToWordAlignmentData, bookId);
    expect(progress).toBeCloseTo(0.086);
  });

  test('should get the progress of a word alignment project', () => {
    let projectSaveLocation = emptyAlignmentToolProject;
    let bookId = 'tit';
    const pathToWordAlignmentData = path.join(projectSaveLocation, '.apps', 'translationCore', 'alignmentData', bookId);
    let progress = ProjectDetailsHelpers.getWordAlignmentProgress(pathToWordAlignmentData, bookId);
    expect(progress).toBe(0);
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
  test('should get the progress which will be used for the side menu bar', () => {
    let projectSaveLocation = alignmentToolProject;
    let bookId = 'tit';
    let groupIndex = { id: 'chapter_1' };
    expect(ProjectDetailsHelpers.getWordAlignmentProgressForGroupIndex(projectSaveLocation, bookId, groupIndex)).toBe(0.1875);
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