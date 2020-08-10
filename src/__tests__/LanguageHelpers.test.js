/* eslint-env jest */
import * as LanguageHelpers from '../js/helpers/LanguageHelpers';
jest.mock('fs-extra');

describe('Test LanguageHelpers',()=>{
  const minimumLangCount = 8020;

  test('getLanguageByCode() should work with mixed and lower case', () => {
    const codes = ['sr-latn', 'sr-Latn', 'SR-LATN', 'ur-deva', 'ur-Deva', 'UR-DEVA', 'ZH'];

    for (let code of codes) {
      const languageData = LanguageHelpers.getLanguageByCode(code);
      expect(languageData).toBeTruthy();
      expect(languageData.code.toLowerCase()).toEqual(code.toLowerCase());
    }
  });

  test('getLanguagesSortedByCode() should work', () => {
    const languages = LanguageHelpers.getLanguagesSortedByCode();
    const langCount = languages.length;
    expect(langCount).not.toBeLessThan(minimumLangCount * 1.1);

    // make sure fields are valid and in sequence
    for (let i = 1; i < langCount; i++) {
      const langA = languages[i - 1];
      const langB = languages[i];

      if (!(langA.code <= langB.code)) {
        console.log('Language codes out of order \'' + langA.code + '\' and \'' + langB.code + '\'');
      }
      expect(langA.code <= langB.code).toBeTruthy();

      if (i === 1) {
        expect(langA.code.length).toBeGreaterThan(0);
        expect(langA.name.length).toBeGreaterThan(0);
        expect(langA.ltr !== undefined).toBeTruthy();
      }
      expect(langB.code.length).toBeGreaterThan(0);
      expect(langB.name.length).toBeGreaterThan(0);
      expect(langB.ltr !== undefined).toBeTruthy();
    }
  });

  test('getLanguagesSortedByNamePrompt() should work', () => {
    const languages = LanguageHelpers.getLanguagesSortedByName();
    const langCount = languages.length;
    expect(langCount).not.toBeLessThan(minimumLangCount * 1.1); // should be more entries with English names

    // make sure fields are valid and in sequence
    for (let i = 1; i < langCount; i++) {
      const langA = languages[i - 1];
      const langB = languages[i];
      const aNameLC = langA.name.toLowerCase();
      const bNameLC = langB.name.toLowerCase();

      if (!(aNameLC <= bNameLC)) {
        console.log('Language prompts out of order \'' + langA.name + '\' and \'' + langB.name + '\'');
      }
      expect(aNameLC <= bNameLC).toBeTruthy();

      if (i === 1) {
        expect(langA.code.length).toBeGreaterThan(0);
        expect(langA.name.length).toBeGreaterThan(0);
        expect(langA.ltr !== undefined).toBeTruthy();
      }
      expect(langB.code.length).toBeGreaterThan(0);
      expect(langB.name.length).toBeGreaterThan(0);
      expect(langB.ltr !== undefined).toBeTruthy();
    }
  });

  test('getLanguageCodes() verify no dups among language codes.', () => {
    let languageCodes = LanguageHelpers.getLanguageCodes();
    let localLanguageCodes = languageCodes.local;
    let localAry = [];

    for (var key in localLanguageCodes) {
      localAry.push( localLanguageCodes[key].code );
    }

    const sorted = localAry.sort();
    let dupsFound = 0;

    for ( let idx = 1; idx < sorted.length; idx++ ) {
      if ( sorted[idx] == sorted[idx-1]) {
        dupsFound++;
      }
    }

    expect(dupsFound).toBeLessThan(1);
    expect(sorted.length).toBeGreaterThan(2000);
  });

  describe('getLanguageByNameSelection()',()=>{
    test('Nepali ne should succeed', () => {
      const code = 'ne';
      const name = 'Nepali';
      let foundLanguage = LanguageHelpers.getLanguageByNameSelection(name, code);

      expect(foundLanguage.name).toEqual(name);
      expect(foundLanguage.code).toEqual(code);
    });

    test('Nepali npi should succeed', () => {
      const code = 'npi';
      const name = 'Nepali';
      let foundLanguage = LanguageHelpers.getLanguageByNameSelection(name, code);

      expect(foundLanguage.name).toEqual(name);
      expect(foundLanguage.code).toEqual(code);
    });

    test('"Nepali [ne]" should succeed', () => {
      const expectedCode = 'ne';
      const name = 'Nepali [ne]';
      let foundLanguage = LanguageHelpers.getLanguageByNameSelection(name);

      expect(foundLanguage.code).toEqual(expectedCode);
    });

    test('"Nepali [npi]" should succeed', () => {
      const expectedCode = 'npi';
      const name = 'Nepali [npi]';
      let foundLanguage = LanguageHelpers.getLanguageByNameSelection(name);

      expect(foundLanguage.code).toEqual(expectedCode);
    });
  });
});
