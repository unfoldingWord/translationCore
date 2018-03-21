import fs from 'fs-extra';
import path from 'path';
import ospath from 'ospath';
// helpers
import * as LexiconHelpers from '../src/js/helpers/LexiconHelpers';

describe('LexiconHelpers', () => {
  test('LexiconHelpers.getLexiconData loads lexicon data for a specific lexiconIda and entryId', () => {
    const languageId = 'en';
    const resourceVersion = 'v0';
    const lexiconId = 'ugl';
    const entryId = '1';
    const lexiconFilePath = path.join(ospath.home(), 'translationCore', 'resources', languageId, 'lexicons', lexiconId, resourceVersion, 'content', '1.json');
    const lexiconContent = {
      "brief": "the first letter of the Greek alphabet",
      "long": "alpha; the first letter of the Greek alphabet."
    };
    fs.__setMockFS({
      [lexiconFilePath]: lexiconContent
    });
    const expectedResult = {
      [lexiconId]: {
        [entryId]: lexiconContent
      }
    };
    expect(LexiconHelpers.getLexiconData(lexiconId, entryId)).toEqual(expectedResult);
  });
});
