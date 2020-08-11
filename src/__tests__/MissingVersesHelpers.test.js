/* eslint-env jest */
import path from 'path-extra';
//helpers
import * as MissingVersesHelpers from '../js/helpers/ProjectValidation/MissingVersesHelpers';
jest.unmock('fs-extra');
//projects
const noMissingVersesProjectPath = path.join(__dirname, 'fixtures/project/missingVerses/no_missing_verses');
const someMissingVersesProjectPath = path.join(__dirname, 'fixtures/project/missingVerses/some_missing_verses');

describe('MissingVersesHelpers.findMissingVerses', () => {
  test('should find missing verses in the project', () => {
    let actualVerses = {
      'chapters': 4,
      '1': 30,
      '2': 30,
      '3': 21,
      '4': 23,
    };
    let missingVerses = MissingVersesHelpers.getMissingVerses(someMissingVersesProjectPath, 'php', actualVerses);
    expect(missingVerses).toEqual({ '1': [ 28, 29, 30 ], '3': [ 21 ] });
  });

  test('should not find missing verses in the project', () => {
    let missingVerses = MissingVersesHelpers.getMissingVerses(noMissingVersesProjectPath, 'tit', {});
    expect(missingVerses).toEqual({});
  });
});
