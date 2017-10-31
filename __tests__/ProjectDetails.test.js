/* eslint-env jest */
import path from 'path-extra';

//helpers
import * as ProjectDetailsHelpers from '../src/js/helpers/ProjectDetailsHelpers';
//projects
const alignmentToolProject = '__tests__/fixtures/project/wordAlignment/normal_project';

describe('ProjectDetailsHelpers.getWordAlignmentProgress', () => {
  test('should get the progress of a word alignment project', () => {
    let projectSaveLocation = alignmentToolProject;
    let bookId = 'tit';
    const pathToWordAlignmentData = path.join(projectSaveLocation, '.apps', 'translationCore', 'alignmentData', bookId);
    let progress = ProjectDetailsHelpers.getWordAlignmentProgress(pathToWordAlignmentData, bookId);
    expect(progress).toBeCloseTo(0.0044);
  });

  test('should get the progress of a word alignment project', () => {
    let projectSaveLocation = '.../randomPath';
    let bookId = 'tit';
    const pathToWordAlignmentData = path.join(projectSaveLocation, '.apps', 'translationCore', 'alignmentData', bookId);
    let progress = ProjectDetailsHelpers.getWordAlignmentProgress(pathToWordAlignmentData, bookId);
    expect(progress).toBe(0);
  });

});