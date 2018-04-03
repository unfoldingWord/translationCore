/* eslint-env jest */

jest.mock('fs-extra');
import ospath from "ospath";
import path from "path-extra";
import fs from 'fs-extra';
import * as gatewayLanguageHelpers from "../src/js/helpers/gatewayLanguageHelpers";

describe('Test getGatewayLanguageList() for TW',()=>{
  beforeEach(() => {
    // reset mock filesystem data
    fs.__resetMockFS();
    fs.__setMockFS({}); // initialize to empty
  });
  afterEach(() => {
    // reset mock filesystem data
    fs.__resetMockFS();
  });

  test('should return an alphabetized list of All Gateway Languages for Titus', () => {
    const RESOURCE_PATH = path.resolve(path.join(ospath.home(), 'translationCore', 'resources'));
    const resourcePath = path.resolve("./fixtures/resources/");
    const copyFiles = ['en/bibles/ult', 'en/translationHelps/translationWords', 'grc/bibles/ugnt'];
    fs.__loadFilesIntoMockFs(copyFiles, resourcePath, RESOURCE_PATH);

    const languages = gatewayLanguageHelpers.getGatewayLanguageList('tit', true);
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

    const languages = gatewayLanguageHelpers.getGatewayLanguageList('tit', true);
    expect(languages.length).toEqual(0);
  });

  test('should return an empty list of Gateway Languages for Titus if ULT not checking 3', () => {
    const RESOURCE_PATH = path.resolve(path.join(ospath.home(), 'translationCore', 'resources'));
    const resourcePath = path.resolve("./fixtures/resources/");
    const copyFiles = ['en/bibles/ult', 'en/translationHelps/translationWords', 'grc/bibles/ugnt'];
    fs.__loadFilesIntoMockFs(copyFiles, resourcePath, RESOURCE_PATH);
    setCheckingLevel(path.join(RESOURCE_PATH, 'en/bibles/ult/v11/manifest.json'), 2);

    const languages = gatewayLanguageHelpers.getGatewayLanguageList('tit', true);
    expect(languages.length).toEqual(0);
  });

  test('should return an empty list of Gateway Languages for Titus if UGNT not checking 2', () => {
    const RESOURCE_PATH = path.resolve(path.join(ospath.home(), 'translationCore', 'resources'));
    const resourcePath = path.resolve("./fixtures/resources/");
    const copyFiles = ['en/bibles/ult', 'en/translationHelps/translationWords', 'grc/bibles/ugnt'];
    fs.__loadFilesIntoMockFs(copyFiles, resourcePath, RESOURCE_PATH);
    setCheckingLevel(path.join(RESOURCE_PATH, 'grc/bibles/ugnt/v0/manifest.json'), 1);

    const languages = gatewayLanguageHelpers.getGatewayLanguageList('tit', true);
    expect(languages.length).toEqual(0);
  });

  test('should return an alphabetized list of All Gateway Languages for Luke', () => {
    const RESOURCE_PATH = path.resolve(path.join(ospath.home(), 'translationCore', 'resources'));
    const resourcePath = path.resolve("./fixtures/resources/");
    const copyFiles = ['en/bibles/ult', 'en/translationHelps/translationWords', 'grc/bibles/ugnt'];
    fs.__loadFilesIntoMockFs(copyFiles, resourcePath, RESOURCE_PATH);

    const languages = gatewayLanguageHelpers.getGatewayLanguageList('luk', true);
    expect(languages.length).toEqual(0);
  });

  test('should return an alphabetized list of All Gateway Languages for Genesis', () => {
    const RESOURCE_PATH = path.resolve(path.join(ospath.home(), 'translationCore', 'resources'));
    const resourcePath = path.resolve("./fixtures/resources/");
    const copyFiles = ['en/bibles/ult', 'en/translationHelps/translationWords', 'he/bibles/uhb'];
    fs.__loadFilesIntoMockFs(copyFiles, resourcePath, RESOURCE_PATH);

    const languages = gatewayLanguageHelpers.getGatewayLanguageList('gen');
    expect(languages.length).toEqual(0);
  });

  test('should return an alphabetized list of All Gateway Languages for Joel', () => {
    const RESOURCE_PATH = path.resolve(path.join(ospath.home(), 'translationCore', 'resources'));
    const resourcePath = path.resolve("./fixtures/resources/");
    const copyFiles = ['en/bibles/ult', 'en/translationHelps/translationWords', 'he/bibles/uhb'];
    fs.__loadFilesIntoMockFs(copyFiles, resourcePath, RESOURCE_PATH);

    fakeResourceByCopying(path.join(RESOURCE_PATH, 'en/bibles/ult/v11'), 'tit', 'jol');

    const languages = gatewayLanguageHelpers.getGatewayLanguageList('jol');
    expect(languages[0].name).toEqual('English');
    expect(languages.length).toEqual(1);
  });

  test('should return an empty list of Gateway Languages for Joel with no ULT', () => {
    const RESOURCE_PATH = path.resolve(path.join(ospath.home(), 'translationCore', 'resources'));
    const resourcePath = path.resolve("./fixtures/resources/");
    const copyFiles = ['en/bibles/ult', 'en/translationHelps/translationWords', 'he/bibles/uhb'];
    fs.__loadFilesIntoMockFs(copyFiles, resourcePath, RESOURCE_PATH);

    const languages = gatewayLanguageHelpers.getGatewayLanguageList('jol');
    expect(languages.length).toEqual(0);
  });
});

describe('Test getGatewayLanguageList() not for TW',()=>{
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

    const languages = gatewayLanguageHelpers.getGatewayLanguageList();
    expect(languages[0].name).toEqual('English');
    expect(languages.length).toEqual(1);
  });

  test('should return an alphabetized list of All Gateway Languages for Titus', () => {
    const RESOURCE_PATH = path.resolve(path.join(ospath.home(), 'translationCore', 'resources'));
    const resourcePath = path.resolve("./fixtures/resources/");
    const copyFiles = ['en/bibles/ult', 'en/translationHelps/translationWords', 'grc/bibles/ugnt'];
    fs.__loadFilesIntoMockFs(copyFiles, resourcePath, RESOURCE_PATH);

    const languages = gatewayLanguageHelpers.getGatewayLanguageList('tit');
    expect(languages[0].name).toEqual('English');
    expect(languages.length).toEqual(1);
  });

  test('should return an alphabetized list of All Gateway Languages for Titus if ULT not checked', () => {
    const RESOURCE_PATH = path.resolve(path.join(ospath.home(), 'translationCore', 'resources'));
    const resourcePath = path.resolve("./fixtures/resources/");
    const copyFiles = ['en/bibles/ult', 'en/translationHelps/translationWords', 'grc/bibles/ugnt'];
    fs.__loadFilesIntoMockFs(copyFiles, resourcePath, RESOURCE_PATH);
    const jsonPath = path.join(RESOURCE_PATH, 'en/bibles/ult/v11/manifest.json');
    const json = fs.readJSONSync(jsonPath);
    delete json['checking'];
    fs.outputJsonSync(jsonPath, json);

    const languages = gatewayLanguageHelpers.getGatewayLanguageList('tit');
    expect(languages[0].name).toEqual('English');
    expect(languages.length).toEqual(1);
  });

  test('should return an alphabetized list of All Gateway Languages for Titus if ULT not checking 3', () => {
    const RESOURCE_PATH = path.resolve(path.join(ospath.home(), 'translationCore', 'resources'));
    const resourcePath = path.resolve("./fixtures/resources/");
    const copyFiles = ['en/bibles/ult', 'en/translationHelps/translationWords', 'grc/bibles/ugnt'];
    fs.__loadFilesIntoMockFs(copyFiles, resourcePath, RESOURCE_PATH);
    setCheckingLevel(path.join(RESOURCE_PATH, 'en/bibles/ult/v11/manifest.json'), 2);

    const languages = gatewayLanguageHelpers.getGatewayLanguageList('tit');
    expect(languages[0].name).toEqual('English');
    expect(languages.length).toEqual(1);
  });

  test('should return an alphabetized list of All Gateway Languages for Titus if UGNT not checking 2', () => {
    const RESOURCE_PATH = path.resolve(path.join(ospath.home(), 'translationCore', 'resources'));
    const resourcePath = path.resolve("./fixtures/resources/");
    const copyFiles = ['en/bibles/ult', 'en/translationHelps/translationWords', 'grc/bibles/ugnt'];
    fs.__loadFilesIntoMockFs(copyFiles, resourcePath, RESOURCE_PATH);
    setCheckingLevel(path.join(RESOURCE_PATH, 'grc/bibles/ugnt/v0/manifest.json'), 1);

    const languages = gatewayLanguageHelpers.getGatewayLanguageList('tit');
    expect(languages[0].name).toEqual('English');
    expect(languages.length).toEqual(1);  });

  test('should return an alphabetized list of All Gateway Languages for Luke', () => {
    const RESOURCE_PATH = path.resolve(path.join(ospath.home(), 'translationCore', 'resources'));
    const resourcePath = path.resolve("./fixtures/resources/");
    const copyFiles = ['en/bibles/ult', 'en/translationHelps/translationWords', 'grc/bibles/ugnt'];
    fs.__loadFilesIntoMockFs(copyFiles, resourcePath, RESOURCE_PATH);

    const languages = gatewayLanguageHelpers.getGatewayLanguageList('luk');
    expect(languages.length).toEqual(0);
  });

  test('should return an alphabetized list of All Gateway Languages for Genesis', () => {
    const RESOURCE_PATH = path.resolve(path.join(ospath.home(), 'translationCore', 'resources'));
    const resourcePath = path.resolve("./fixtures/resources/");
    const copyFiles = ['en/bibles/ult', 'en/translationHelps/translationWords', 'he/bibles/uhb'];
    fs.__loadFilesIntoMockFs(copyFiles, resourcePath, RESOURCE_PATH);

    const languages = gatewayLanguageHelpers.getGatewayLanguageList('gen');
    expect(languages.length).toEqual(0);
  });

  test('should return an alphabetized list of All Gateway Languages for Joel', () => {
    const RESOURCE_PATH = path.resolve(path.join(ospath.home(), 'translationCore', 'resources'));
    const resourcePath = path.resolve("./fixtures/resources/");
    const copyFiles = ['en/bibles/ult', 'en/translationHelps/translationWords', 'he/bibles/uhb'];
    fs.__loadFilesIntoMockFs(copyFiles, resourcePath, RESOURCE_PATH);

    fakeResourceByCopying(path.join(RESOURCE_PATH, 'en/bibles/ult/v11'), 'tit', 'jol');

    const languages = gatewayLanguageHelpers.getGatewayLanguageList('jol');
    expect(languages[0].name).toEqual('English');
    expect(languages.length).toEqual(1);
  });

  test('should return an alphabetized list of All Gateway Languages for Joel with Hindi', () => {
    const RESOURCE_PATH = path.resolve(path.join(ospath.home(), 'translationCore', 'resources'));
    const resourcePath = path.resolve("./fixtures/resources/");
    const copyFiles = ['en/bibles/ult', 'en/translationHelps/translationWords', 'he/bibles/uhb'];
    fs.__loadFilesIntoMockFs(copyFiles, resourcePath, RESOURCE_PATH);

    fakeResourceByCopying(path.join(RESOURCE_PATH, 'en/bibles/ult/v11'), 'tit', 'jol');
    fakeResourceByCopying(RESOURCE_PATH, 'en/bibles/ult/v11/jol', 'hi/bibles/ulb/v11/jol');
    fakeResourceByCopying(RESOURCE_PATH, 'en/bibles/ult/v11/manifest.json', 'hi/bibles/ulb/v11/manifest.json');

    const languages = gatewayLanguageHelpers.getGatewayLanguageList('jol');
    expect(languages[0].name).toEqual('English');
    expect(languages[1].lc).toEqual('hi');
    expect(languages.length).toEqual(2);
  });

  test('should return an empty list of Gateway Languages for Joel with no ULT', () => {
    const RESOURCE_PATH = path.resolve(path.join(ospath.home(), 'translationCore', 'resources'));
    const resourcePath = path.resolve("./fixtures/resources/");
    const copyFiles = ['en/bibles/ult', 'en/translationHelps/translationWords', 'he/bibles/uhb'];
    fs.__loadFilesIntoMockFs(copyFiles, resourcePath, RESOURCE_PATH);

    const languages = gatewayLanguageHelpers.getGatewayLanguageList('jol');
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

function fakeResourceByCopying(resourcePath_, sourceBook, destBook) {
  const sourcePath = path.join(resourcePath_, sourceBook);
  const destPath = path.join(resourcePath_, destBook);
  fs.copySync(sourcePath, destPath);
}
