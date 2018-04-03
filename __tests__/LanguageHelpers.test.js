/* eslint-env jest */

jest.mock('fs-extra');
import ospath from "ospath";
import path from "path-extra";
import fs from 'fs-extra';
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
});

describe('Test getGatewayLanguageList()',()=>{
  beforeEach(() => {
    // reset mock filesystem data
    fs.__resetMockFS();
    fs.__setMockFS({}); // initialize to empty
  });
  afterEach(() => {
    // reset mock filesystem data
    fs.__resetMockFS();
  });

  test('should return an alphabetized list of All Gateway Languages', () => {
    const RESOURCE_PATH = path.resolve(path.join(ospath.home(), 'translationCore', 'resources'));
    const resourcePath = path.resolve("./fixtures/resources/");
    const copyFiles = ['en/bibles/ult', 'en/translationHelps/translationWords', 'grc/bibles/ugnt'];
    fs.__loadFilesIntoMockFs(copyFiles, resourcePath, RESOURCE_PATH);

    const languages = LanguageHelpers.getGatewayLanguageList();
    expect(languages[0].name).toEqual('English');
    expect(languages.length).toEqual(1);
  });

  test('should return an alphabetized list of All Gateway Languages for Titus', () => {
    const RESOURCE_PATH = path.resolve(path.join(ospath.home(), 'translationCore', 'resources'));
    const resourcePath = path.resolve("./fixtures/resources/");
    const copyFiles = ['en/bibles/ult', 'en/translationHelps/translationWords', 'grc/bibles/ugnt'];
    fs.__loadFilesIntoMockFs(copyFiles, resourcePath, RESOURCE_PATH);

    const languages = LanguageHelpers.getGatewayLanguageList('tit');
    expect(languages[0].name).toEqual('English');
    expect(languages.length).toEqual(1);
  });

  test('should return an empty list of Gateway Languages for Titus if ULT not checked', () => {
    const RESOURCE_PATH = path.resolve(path.join(ospath.home(), 'translationCore', 'resources'));
    const resourcePath = path.resolve("./fixtures/resources/");
    const copyFiles = ['en/bibles/ult', 'en/translationHelps/translationWords', 'grc/bibles/ugnt'];
    fs.__loadFilesIntoMockFs(copyFiles, resourcePath, RESOURCE_PATH);
    const jsonPath = path.join(RESOURCE_PATH, 'en/bibles/ult/v11/manifest.json');
    const json = fs.readJSONSync(jsonPath);
    delete json['checking'];
    fs.outputJsonSync(jsonPath, json);

    const languages = LanguageHelpers.getGatewayLanguageList('tit');
    expect(languages.length).toEqual(0);
  });

  test('should return an empty list of Gateway Languages for Titus if ULT not checking 3', () => {
    const RESOURCE_PATH = path.resolve(path.join(ospath.home(), 'translationCore', 'resources'));
    const resourcePath = path.resolve("./fixtures/resources/");
    const copyFiles = ['en/bibles/ult', 'en/translationHelps/translationWords', 'grc/bibles/ugnt'];
    fs.__loadFilesIntoMockFs(copyFiles, resourcePath, RESOURCE_PATH);
    setCheckingLevel(path.join(RESOURCE_PATH, 'en/bibles/ult/v11/manifest.json'), 2);

    const languages = LanguageHelpers.getGatewayLanguageList('tit');
    expect(languages.length).toEqual(0);
  });

  test('should return an empty list of Gateway Languages for Titus if UGNT not checking 2', () => {
    const RESOURCE_PATH = path.resolve(path.join(ospath.home(), 'translationCore', 'resources'));
    const resourcePath = path.resolve("./fixtures/resources/");
    const copyFiles = ['en/bibles/ult', 'en/translationHelps/translationWords', 'grc/bibles/ugnt'];
    fs.__loadFilesIntoMockFs(copyFiles, resourcePath, RESOURCE_PATH);
    setCheckingLevel(path.join(RESOURCE_PATH, 'grc/bibles/ugnt/v0/manifest.json'), 1);

    const languages = LanguageHelpers.getGatewayLanguageList('tit');
    expect(languages.length).toEqual(0);
  });

  test('should return an alphabetized list of All Gateway Languages for Luke', () => {
    const RESOURCE_PATH = path.resolve(path.join(ospath.home(), 'translationCore', 'resources'));
    const resourcePath = path.resolve("./fixtures/resources/");
    const copyFiles = ['en/bibles/ult', 'en/translationHelps/translationWords', 'grc/bibles/ugnt'];
    fs.__loadFilesIntoMockFs(copyFiles, resourcePath, RESOURCE_PATH);

    const languages = LanguageHelpers.getGatewayLanguageList('luk');
    expect(languages.length).toEqual(0);
  });

  test('should return an alphabetized list of All Gateway Languages for Genesis', () => {
    const RESOURCE_PATH = path.resolve(path.join(ospath.home(), 'translationCore', 'resources'));
    const resourcePath = path.resolve("./fixtures/resources/");
    const copyFiles = ['en/bibles/ult', 'en/translationHelps/translationWords', 'he/bibles/uhb'];
    fs.__loadFilesIntoMockFs(copyFiles, resourcePath, RESOURCE_PATH);

    const languages = LanguageHelpers.getGatewayLanguageList('gen');
    expect(languages.length).toEqual(0);
  });

  test('should return an alphabetized list of All Gateway Languages for Joel', () => {
    const RESOURCE_PATH = path.resolve(path.join(ospath.home(), 'translationCore', 'resources'));
    const resourcePath = path.resolve("./fixtures/resources/");
    const copyFiles = ['en/bibles/ult', 'en/translationHelps/translationWords', 'he/bibles/uhb'];
    fs.__loadFilesIntoMockFs(copyFiles, resourcePath, RESOURCE_PATH);

    fakeBibleBookByCopying(path.join(RESOURCE_PATH, 'en/bibles/ult/v11'), 'tit', 'jol');

    const languages = LanguageHelpers.getGatewayLanguageList('jol');
    expect(languages[0].name).toEqual('English');
    expect(languages.length).toEqual(1);
  });

  test('should return an empty list of Gateway Languages for Joel with no ULT', () => {
    const RESOURCE_PATH = path.resolve(path.join(ospath.home(), 'translationCore', 'resources'));
    const resourcePath = path.resolve("./fixtures/resources/");
    const copyFiles = ['en/bibles/ult', 'en/translationHelps/translationWords', 'he/bibles/uhb'];
    fs.__loadFilesIntoMockFs(copyFiles, resourcePath, RESOURCE_PATH);

    const languages = LanguageHelpers.getGatewayLanguageList('jol');
    expect(languages.length).toEqual(0);
  });

});

//
// helper functions
//

function setCheckingLevel(jsonPath, level) {
  const json = fs.readJSONSync(jsonPath);
  json.checking.checking_level = level.toString();
  fs.outputJsonSync(jsonPath, json);
}

function fakeBibleBookByCopying(resourcePath_, sourceBook, destBook) {
  const sourcePath = path.join(resourcePath_, sourceBook);
  const destPath = path.join(resourcePath_, destBook);
  fs.copySync(sourcePath, destPath);
}
