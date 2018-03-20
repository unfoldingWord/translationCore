/* eslint-env jest */

import * as LanguageHelpers from "../src/js/helpers/LanguageHelpers";

describe('Test LanguageHelpers',()=>{
  const minimumLangCount = 8020;

  test('getLanguagesSortedByCode() should work', () => {
    const languages = LanguageHelpers.getLanguagesSortedByCode();
    const langCount = languages.length;
    expect(langCount).not.toBeLessThan(minimumLangCount * 1.1);

    // make sure fields are valid and in sequence
    for (let i = 1; i < langCount; i++) {
      const langA = languages[i - 1];
      const langB = languages[i];
      if (!(langA.code <= langB.code)) {
        console.log("Language codes out of order '" + langA.code + "' and '" + langB.code + "'");
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
        console.log("Language prompts out of order '" + langA.name + "' and '" + langB.name + "'");
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

  test('getGLHint() should return the desired tool tip for the launch button', () => {
    const translate = (key) => key;

    let hint = LanguageHelpers.getGLHint(null, translate);
    let expectedHint = "tools.please_select_gl";
    expect(hint).toEqual(expectedHint);

    hint = LanguageHelpers.getGLHint(LanguageHelpers.DEFAULT_GATEWAY_LANGUAGE, translate);
    expectedHint = null;
    expect(hint).toEqual(expectedHint);

    hint = LanguageHelpers.getGLHint('hi', translate);
    expectedHint = "only_english";
    expect(hint).toEqual(expectedHint);
  });

  test('getGatewayLanguageList() should return an alphabetized list of Gateway Languages', () => {
    const languages = LanguageHelpers.getGatewayLanguageList();
    expect(languages[0].name).toEqual('English');
  });
});

