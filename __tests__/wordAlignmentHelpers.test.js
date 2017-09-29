/* eslint-env jest */
import isEqual from 'lodash/isEqual';
//helpers
import * as wordAlignmentHelpers from '../src/js/helpers/wordAlignmentHelpers';

describe('wordAlignmentHelpers.sortWordObjectsByString', () => {
  const string = 'qwerty asdf zxcv uiop jkl; bnm, qwerty asdf zxcv jkl; bnm,';
  it('should return wordObjectsArray sorted and in order', function () {
    const wordObjectArray = [
      { text: 'zxcv', occurrence: 2, occurrences: 2 },
      { text: 'qwerty', occurrence: 2, occurrences: 2 },
      { text: 'qwerty', occurrence: 1, occurrences: 2 },
      { text: 'zxcv', occurrence: 1, occurrences: 2 }
    ];
    const output = wordAlignmentHelpers.sortWordObjectsByString(wordObjectArray, string);
    const expected = [
      { text: 'qwerty', occurrence: 1, occurrences: 2 },
      { text: 'qwerty', occurrence: 2, occurrences: 2 },
      { text: 'zxcv', occurrence: 1, occurrences: 2 },
      { text: 'zxcv', occurrence: 2, occurrences: 2 }
    ];
    expect(isEqual(expected, output)).toBeTruthy;
  });
});
