/* eslint-env jest */

jest.unmock('fs-extra');
import path from 'path-extra';
//helpers
import * as ProjectDetailsHelpers from '../src/js/helpers/ProjectDetailsHelpers';
//projects
const alignmentToolProject = '__tests__/fixtures/project/wordAlignment/normal_project';
const emptyAlignmentToolProject = '__tests__/fixtures/project/wordAlignment/empty_project';
const translationWordsProject = '__tests__/fixtures/project/translationWords/normal_project';
const INDEX_FOLDER_PATH = path.join('.apps', 'translationCore', 'index');



describe('ProjectDetailsHelpers.getWordAlignmentProgress', () => {

  beforeAll(() => {
    // // TRICKY: this is a bad hack to get these tests working.
    // // the code hard-codes production paths so we have to populate the data.
    const ResourcesActions = require('../src/js/actions/ResourcesActions');
    ResourcesActions.getResourcesFromStaticPackage();
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
