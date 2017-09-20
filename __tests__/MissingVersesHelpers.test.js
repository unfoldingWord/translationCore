/* eslint-env jest */

//helpers
import * as MissingVersesHelpers from '../src/js/helpers/MissingVersesHelpers';
//projects
const noMissingVersesProjectPath = '__tests__/fixtures/project/missingVerses/no_missing_verses';
const someMissingVersesProjectPath = '__tests__/fixtures/project/missingVerses/some_missing_verses';

describe('MissingVersesHelpers.findMissingVerses', () => {
  test('should find missing verses in the project', () => {
    let missingVerses = MissingVersesHelpers.findMissingVerses(someMissingVersesProjectPath, 'php');
    expect(missingVerses).toEqual({ '1': [ 28, 29, 30 ], '3': [ 21 ] });
  });

  test('should not find missing verses in the project', () => {
    let missingVerses = MissingVersesHelpers.findMissingVerses(noMissingVersesProjectPath, 'tit');
    expect(missingVerses).toEqual({});
  });
});