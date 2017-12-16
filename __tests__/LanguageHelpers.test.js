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
      if (!(langA.code < langB.code)) {
        console.log("Language names out of order '" + langA.code + "' and '" + langB.code + "'");
      }
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

  test('getLanguagesSortedByNamePrompt() should work', () => {
    const languages = LanguageHelpers.getLanguagesSortedByName();
    const langCount = languages.length;
    expect(langCount).not.toBeLessThan(minimumLangCount * 1.1); // should be more entries with English names

    // make sure fields are valid and in sequence
    for (let i = 1; i < langCount; i++) {
      const langA = languages[i - 1];
      const langB = languages[i];
      if (!(langA.namePrompt < langB.namePrompt)) {
        console.log("Language prompts out of order '" + langA.namePrompt + "' and '" + langB.namePrompt + "'");
      }
      expect(langA.namePrompt <= langB.namePrompt).toBeTruthy();
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

