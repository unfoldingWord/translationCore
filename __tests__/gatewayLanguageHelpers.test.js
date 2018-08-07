/* eslint-env jest */

jest.mock('fs-extra');
import ospath from "ospath";
import path from "path-extra";
import fs from 'fs-extra';
// helpers
import * as gatewayLanguageHelpers from "../src/js/helpers/gatewayLanguageHelpers";
import * as ResourcesHelpers from "../src/js/helpers/ResourcesHelpers";

const RESOURCE_PATH = path.resolve(path.join(ospath.home(), 'translationCore', 'resources'));
const testResourcePath = path.join(__dirname, 'fixtures/resources');

describe('Test getGatewayLanguageList() for TW',()=>{
  const toolName = 'translationWords';

  beforeEach(() => {
    // reset mock filesystem data
    fs.__resetMockFS();
    fs.__setMockFS({}); // initialize to empty
  });
  afterEach(() => {
    // reset mock filesystem data
    fs.__resetMockFS();
  });

  test('should return an alphabetized list for Titus (English only)', () => {
    const copyFiles = ['en/bibles/ult/v12.1', 'en/translationHelps/translationWords', 'grc/bibles/ugnt'];
    fs.__loadFilesIntoMockFs(copyFiles, testResourcePath, RESOURCE_PATH);
    setupDummyOLs('grk');

    const languages = gatewayLanguageHelpers.getGatewayLanguageList('tit', toolName);
    expect(languages[0].name).toEqual('English');
    expect(languages.length).toEqual(1);
  });

  test('should return an empty list for Titus if ULT not checked', () => {
    const copyFiles = ['en/bibles/ult/v12.1', 'en/translationHelps/translationWords', 'grc/bibles/ugnt'];
    fs.__loadFilesIntoMockFs(copyFiles, testResourcePath, RESOURCE_PATH);
    setupDummyOLs('grk');
    const jsonPath = path.join(RESOURCE_PATH, 'en/bibles/ult/v12.1/manifest.json');
    const json = fs.readJSONSync(jsonPath);
    delete json['checking'];
    fs.outputJsonSync(jsonPath, json);

    const languages = gatewayLanguageHelpers.getGatewayLanguageList('tit', toolName);
    expect(languages.length).toEqual(0);
  });

  test('should return an empty list for Titus if ULT not checking 3', () => {
    const copyFiles = ['en/bibles/ult/v12.1', 'en/translationHelps/translationWords', 'grc/bibles/ugnt'];
    fs.__loadFilesIntoMockFs(copyFiles, testResourcePath, RESOURCE_PATH);
    setupDummyOLs('grk');
    setCheckingLevel(path.join(RESOURCE_PATH, 'en/bibles/ult/v12.1/manifest.json'), 2);

    const languages = gatewayLanguageHelpers.getGatewayLanguageList('tit', toolName);
    expect(languages.length).toEqual(0);
  });

  test('should return an empty list for Titus if UGNT not checking 2', () => {
    const copyFiles = ['en/bibles/ult/v12.1', 'en/translationHelps/translationWords', 'grc/bibles/ugnt'];
    fs.__loadFilesIntoMockFs(copyFiles, testResourcePath, RESOURCE_PATH);
    setupDummyOLs('grk');
    setCheckingLevel(path.join(RESOURCE_PATH, 'grc/bibles/ugnt/v0/manifest.json'), 1);

    const languages = gatewayLanguageHelpers.getGatewayLanguageList('tit', toolName);
    expect(languages.length).toEqual(0);
  });

  test('should return an empty list for Luke', () => {
    const copyFiles = ['en/bibles/ult/v12.1', 'en/translationHelps/translationWords', 'grc/bibles/ugnt'];
    fs.__loadFilesIntoMockFs(copyFiles, testResourcePath, RESOURCE_PATH);
    setupDummyOLs('grk');

    const languages = gatewayLanguageHelpers.getGatewayLanguageList('luk', toolName);
    expect(languages.length).toEqual(0);
  });

  test('should return an empty list for Genesis', () => {
    const copyFiles = ['en/bibles/ult/v12.1', 'en/translationHelps/translationWords', 'he/bibles/uhb'];
    fs.__loadFilesIntoMockFs(copyFiles, testResourcePath, RESOURCE_PATH);
    setupDummyOLs('he');

    const languages = gatewayLanguageHelpers.getGatewayLanguageList('gen');
    expect(languages.length).toEqual(0);
  });

  test('should return an alphabetized list of All Gateway Languages for Joel', () => {
    const copyFiles = ['en/bibles/ult/v12.1', 'en/translationHelps/translationWords', 'he/bibles/uhb'];
    fs.__loadFilesIntoMockFs(copyFiles, testResourcePath, RESOURCE_PATH);
    setupDummyOLs('he');

    // fake the book of Joel
    fakeResourceByCopying(path.join(RESOURCE_PATH, 'en/bibles/ult/v12.1'), 'tit', 'jol');

    const languages = gatewayLanguageHelpers.getGatewayLanguageList('jol', toolName);
    expect(languages[0].name).toEqual('English');
    expect(languages.length).toEqual(1);
  });

  test('should return an empty list of Gateway Languages for Joel with no ULT', () => {
    const copyFiles = ['en/bibles/ult/v12.1', 'en/translationHelps/translationWords', 'he/bibles/uhb'];
    fs.__loadFilesIntoMockFs(copyFiles, testResourcePath, RESOURCE_PATH);
    setupDummyOLs('he');

    const languages = gatewayLanguageHelpers.getGatewayLanguageList('jol', toolName);
    expect(languages.length).toEqual(0);
  });
});

describe('Test getGatewayLanguageList() for WA',()=>{
  const toolName = 'wordAlignment';

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
    const copyFiles = ['en/bibles/ult/v12.1', 'en/translationHelps/translationWords', 'grc/bibles/ugnt'];
    fs.__loadFilesIntoMockFs(copyFiles, testResourcePath, RESOURCE_PATH);

    // fake a hindi bible
    fakeResourceByCopying(RESOURCE_PATH, 'en/bibles/ult/v12.1/tit', 'hi/bibles/ulb/v12.1/tit');
    fakeResourceByCopying(RESOURCE_PATH, 'en/bibles/ult/v12.1/manifest.json', 'hi/bibles/ulb/v12.1/manifest.json');

    const languages = gatewayLanguageHelpers.getGatewayLanguageList('tit', toolName);
    expect(languages[0].name).toEqual('English');
    expect(languages[1].lc).toEqual('hi');
    expect(languages.length).toEqual(2);
  });

  test('should return an empty list of All Gateway Languages for Titus if no alignments', () => {
    const copyFiles = ['en/bibles/ult/v11', 'en/translationHelps/translationWords', 'grc/bibles/ugnt'];
    fs.__loadFilesIntoMockFs(copyFiles, testResourcePath, RESOURCE_PATH);

    const languages = gatewayLanguageHelpers.getGatewayLanguageList('tit', toolName);
    expect(languages.length).toEqual(0);
  });

  test('should return an alphabetized list of All Gateway Languages for Titus if ULT not checked', () => {
    const copyFiles = ['en/bibles/ult/v12.1', 'en/translationHelps/translationWords', 'grc/bibles/ugnt'];
    fs.__loadFilesIntoMockFs(copyFiles, testResourcePath, RESOURCE_PATH);
    const jsonPath = path.join(RESOURCE_PATH, 'en/bibles/ult/v12.1/manifest.json');
    const json = fs.readJSONSync(jsonPath);
    delete json['checking'];
    fs.outputJsonSync(jsonPath, json);

    const languages = gatewayLanguageHelpers.getGatewayLanguageList('tit', toolName);
    expect(languages[0].name).toEqual('English');
    expect(languages.length).toEqual(1);
  });

  test('should return an alphabetized list of All Gateway Languages for Titus if ULT not checking 3', () => {
    const copyFiles = ['en/bibles/ult/v12.1', 'en/translationHelps/translationWords', 'grc/bibles/ugnt'];
    fs.__loadFilesIntoMockFs(copyFiles, testResourcePath, RESOURCE_PATH);
    setCheckingLevel(path.join(RESOURCE_PATH, 'en/bibles/ult/v12.1/manifest.json'), 2);

    const languages = gatewayLanguageHelpers.getGatewayLanguageList('tit', toolName);
    expect(languages[0].name).toEqual('English');
    expect(languages.length).toEqual(1);
  });

  test('should return an alphabetized list of All Gateway Languages for Titus if UGNT not checking 2', () => {
    const copyFiles = ['en/bibles/ult/v12.1', 'en/translationHelps/translationWords', 'grc/bibles/ugnt'];
    fs.__loadFilesIntoMockFs(copyFiles, testResourcePath, RESOURCE_PATH);
    setCheckingLevel(path.join(RESOURCE_PATH, 'grc/bibles/ugnt/v0/manifest.json'), 1);

    const languages = gatewayLanguageHelpers.getGatewayLanguageList('tit', toolName);
    expect(languages[0].name).toEqual('English');
    expect(languages.length).toEqual(1);  });

  test('should return an alphabetized list of All Gateway Languages for Luke', () => {
    const copyFiles = ['en/bibles/ult/v12.1', 'en/translationHelps/translationWords', 'grc/bibles/ugnt'];
    fs.__loadFilesIntoMockFs(copyFiles, testResourcePath, RESOURCE_PATH);

    const languages = gatewayLanguageHelpers.getGatewayLanguageList('luk', toolName);
    expect(languages.length).toEqual(0);
  });

  test('should return an alphabetized list of All Gateway Languages for Genesis', () => {
    const copyFiles = ['en/bibles/ult/v12.1', 'en/translationHelps/translationWords', 'he/bibles/uhb'];
    fs.__loadFilesIntoMockFs(copyFiles, testResourcePath, RESOURCE_PATH);

    const languages = gatewayLanguageHelpers.getGatewayLanguageList('gen', toolName);
    expect(languages.length).toEqual(0);
  });

  test('should return an alphabetized list of All Gateway Languages for Joel', () => {
    const copyFiles = ['en/bibles/ult/v12.1', 'en/translationHelps/translationWords', 'he/bibles/uhb'];
    fs.__loadFilesIntoMockFs(copyFiles, testResourcePath, RESOURCE_PATH);

    // fake the book of joel
    fakeResourceByCopying(path.join(RESOURCE_PATH, 'en/bibles/ult/v12.1'), 'tit', 'jol');

    const languages = gatewayLanguageHelpers.getGatewayLanguageList('jol', toolName);
    expect(languages[0].name).toEqual('English');
    expect(languages.length).toEqual(1);
  });

  test('should return an alphabetized list of All Gateway Languages for Joel with Hindi', () => {
    const copyFiles = ['en/bibles/ult/v12.1', 'en/translationHelps/translationWords', 'he/bibles/uhb'];
    fs.__loadFilesIntoMockFs(copyFiles, testResourcePath, RESOURCE_PATH);

    // fake the book of joel
    fakeResourceByCopying(path.join(RESOURCE_PATH, 'en/bibles/ult/v12.1'), 'tit', 'jol');
    // fake a hindi bible
    fakeResourceByCopying(RESOURCE_PATH, 'en/bibles/ult/v12.1/jol', 'hi/bibles/ulb/v12.1/jol');
    fakeResourceByCopying(RESOURCE_PATH, 'en/bibles/ult/v12.1/manifest.json', 'hi/bibles/ulb/v12.1/manifest.json');

    const languages = gatewayLanguageHelpers.getGatewayLanguageList('jol', toolName);
    expect(languages[0].name).toEqual('English');
    expect(languages[1].lc).toEqual('hi');
    expect(languages.length).toEqual(2);
  });

  test('should return only greek for gal with Hindi (gal is not aligned in en or hi here)', () => {
    const copyFiles = ['en/bibles/ult/v12.1', 'en/translationHelps/translationWords', 'grc/bibles/ugnt'];
    fs.__loadFilesIntoMockFs(copyFiles, testResourcePath, RESOURCE_PATH);

    const languages = gatewayLanguageHelpers.getGatewayLanguageList('gal', toolName);
    expect(languages[0].name).toEqual('Greek');
    expect(languages.length).toEqual(1);
  });

  test('should return an empty list of Gateway Languages for Joel with no ULT', () => {
    const copyFiles = ['en/bibles/ult/v12.1', 'en/translationHelps/translationWords', 'he/bibles/uhb'];
    fs.__loadFilesIntoMockFs(copyFiles, testResourcePath, RESOURCE_PATH);

    const languages = gatewayLanguageHelpers.getGatewayLanguageList('jol', toolName);
    expect(languages.length).toEqual(0);
  });
});

//
// helper functions
//

function setupDummyOLs(ol) {
// add dummy resources
  fs.copySync(path.join(RESOURCE_PATH, 'en/translationHelps/translationWords'), path.join(RESOURCE_PATH, ol + '/translationHelps/translationWords'));
}

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
