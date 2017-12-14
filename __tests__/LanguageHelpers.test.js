/* eslint-env jest */

import * as LanguageHelpers from "../src/js/helpers/LanguageHelpers";

describe('Test LanguageHelpers',()=>{
  const minimumLangCount = 8020;

  test('getLanguages() should work', () => {
    const languages = LanguageHelpers.getLanguages();
    const langCount = languages.length;
    expect(langCount).not.toBeLessThan(minimumLangCount);

    // make sure fields are valid and in sequence
    for (let i = 1; i < langCount; i++) {
      const langA = languages[i - 1];
      const langB = languages[i];
      expect(langA.code < langB.code).toBeTruthy();
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

  test('getLanguagesSortedByName() should work', () => {
    const languages = LanguageHelpers.getLanguagesSortedByName();
    const langCount = languages.length;
    expect(langCount).not.toBeLessThan(minimumLangCount);

    // make sure fields are valid and in sequence
    for (let i = 1; i < langCount; i++) {
      const langA = languages[i - 1];
      const langB = languages[i];
      if (!(langA.name < langB.name)) {
        console.log("Help");
      }
      expect(langA.name <= langB.name).toBeTruthy();
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
});

