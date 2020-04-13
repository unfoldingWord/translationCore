import path from 'path';
import fs from 'fs-extra';
import env from 'tc-electron-env';
// helpers
import * as LexiconHelpers from '../js/helpers/LexiconHelpers';

describe('LexiconHelpers', () => {
  beforeEach(() => {
    fs.__resetMockFS();
  });

  test('LexiconHelpers.getLexiconData loads lexicon data for a specific lexiconIda and entryId', () => {
    const languageId = 'en';
    const resourceVersion = 'v0';
    const lexiconId = 'ugl';
    const entryId = '1';
    const lexiconFilePath = path.join(env.home(), 'translationCore', 'resources', languageId, 'lexicons', lexiconId, resourceVersion, 'content', '1.json');
    const lexiconContent = {
      'brief': 'the first letter of the Greek alphabet',
      'long': 'alpha; the first letter of the Greek alphabet.',
    };
    fs.outputFileSync(lexiconFilePath, lexiconContent);
    const expectedResult = { [lexiconId]: { [entryId]: lexiconContent } };
    expect(LexiconHelpers.getLexiconData(lexiconId, entryId)).toEqual(expectedResult);
  });

  test('LexiconHelpers.getLexiconData loads lexicon data for v0.1 resource', () => {
    const languageId = 'en';
    const resourceVersion = 'v0.1';
    const lexiconId = 'uhl';
    const entryId = '1';
    const lexiconFilePath = path.join(env.home(), 'translationCore', 'resources', languageId, 'lexicons', lexiconId, resourceVersion, 'content', '1.json');
    const lexiconContent = {
      'brief': 'father',
      'long': '<i>Meaning:</i> "father", in a literal and immediate, or figurative and remote application.<br/><i>Usage:</i> chief, (fore-) father(-less), × patrimony, principal. Compare names in \'Abi-\'.<br/><i>Source:</i> a primitive word;',
    };
    fs.outputFileSync(lexiconFilePath, lexiconContent);
    const expectedResult = { [lexiconId]: { [entryId]: lexiconContent } };
    expect(LexiconHelpers.getLexiconData(lexiconId, entryId)).toEqual(expectedResult);
  });
});
