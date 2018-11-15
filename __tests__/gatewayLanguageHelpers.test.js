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

describe('Test getGatewayLanguageList() for TN',()=> {
  const toolName = 'translationNotes';

  describe('general tests', () => {
    beforeEach(() => {
      // reset mock filesystem data
      fs.__resetMockFS();
      fs.__setMockFS({}); // initialize to empty
    });
    afterEach(() => {
      // reset mock filesystem data
      fs.__resetMockFS();
    });

    test('should return English & Hindi for Titus', () => {
      const copyFiles = ['en/bibles/ult/v12.1', 'en/translationHelps/translationWords', 'grc/bibles/ugnt'];
      fs.__loadFilesIntoMockFs(copyFiles, testResourcePath, RESOURCE_PATH);

      // fake TN and TA
      fakeResourceByCopying(RESOURCE_PATH, 'en/translationHelps/translationWords', 'en/translationHelps/translationNotes');
      fakeResourceByCopying(RESOURCE_PATH, 'en/translationHelps/translationWords', 'en/translationHelps/translationAcademy');

      // fake a hindi bible
      fakeResourceByCopying(RESOURCE_PATH, 'en/bibles/ult', 'hi/bibles/ulb');
      fakeResourceByCopying(RESOURCE_PATH, 'en/translationHelps', 'hi/translationHelps');

      const languages = gatewayLanguageHelpers.getGatewayLanguageList('tit', toolName);
      expect(languages[0].name).toEqual('English');
      expect(languages[1].lc).toEqual('hi');
      expect(languages.length).toEqual(2);
    });
  });
});

describe('Test getGatewayLanguageList() for TW',()=>{
  const toolName = 'translationWords';

  describe('general tests',()=> {
    beforeEach(() => {
      // reset mock filesystem data
      fs.__resetMockFS();
      fs.__setMockFS({}); // initialize to empty
    });
    afterEach(() => {
      // reset mock filesystem data
      fs.__resetMockFS();
    });

    test('should return English & Hindi for Titus', () => {
      const copyFiles = ['en/bibles/ult/v12.1', 'en/translationHelps/translationWords', 'grc/bibles/ugnt'];
      fs.__loadFilesIntoMockFs(copyFiles, testResourcePath, RESOURCE_PATH);

      // fake a hindi bible
      fakeResourceByCopying(RESOURCE_PATH, 'en/bibles/ult', 'hi/bibles/ulb');
      fakeResourceByCopying(RESOURCE_PATH, 'en/translationHelps', 'hi/translationHelps');

      const languages = gatewayLanguageHelpers.getGatewayLanguageList('tit', toolName);
      expect(languages[0].name).toEqual('English');
      expect(languages[1].lc).toEqual('hi');
      expect(languages.length).toEqual(2);
    });

    test('should return English for Joel', () => {
      const copyFiles = ['en/bibles/ult/v12.1', 'en/translationHelps/translationWords', 'hbo/bibles/uhb'];
      fs.__loadFilesIntoMockFs(copyFiles, testResourcePath, RESOURCE_PATH);
      setupDummyHelps('hbo');

      // fake the book of Joel
      fakeResourceByCopying(path.join(RESOURCE_PATH, 'en/bibles/ult/v12.1'), 'tit', 'jol');

      const languages = gatewayLanguageHelpers.getGatewayLanguageList('jol', toolName);
      expect(languages[0].name).toEqual('English');
      expect(languages.length).toEqual(1);
    });
  });

  describe('checking tests',()=> {
    beforeEach(() => {
      // reset mock filesystem data
      fs.__resetMockFS();
      fs.__setMockFS({}); // initialize to empty
    });
    afterEach(() => {
      // reset mock filesystem data
      fs.__resetMockFS();
    });

    test('should return an empty list for Titus if ULT not checked', () => {
      const copyFiles = ['en/bibles/ult/v12.1', 'en/translationHelps/translationWords', 'grc/bibles/ugnt'];
      fs.__loadFilesIntoMockFs(copyFiles, testResourcePath, RESOURCE_PATH);
      setupDummyHelps('grk');
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
      setupDummyHelps('grk');
      setCheckingLevel(path.join(RESOURCE_PATH, 'en/bibles/ult/v12.1/manifest.json'), 2);

      const languages = gatewayLanguageHelpers.getGatewayLanguageList('tit', toolName);
      expect(languages.length).toEqual(0);
    });

    test('should return an empty list for Titus if UGNT not checking 2', () => {
      const copyFiles = ['en/bibles/ult/v12.1', 'en/translationHelps/translationWords', 'grc/bibles/ugnt'];
      fs.__loadFilesIntoMockFs(copyFiles, testResourcePath, RESOURCE_PATH);
      setupDummyHelps('grk');
      const ugntVersionPath = ResourcesHelpers.getLatestVersionInPath(path.join(RESOURCE_PATH, 'grc/bibles/ugnt'));
      setCheckingLevel(path.join(ugntVersionPath, 'manifest.json'), 1);

      const languages = gatewayLanguageHelpers.getGatewayLanguageList('tit', toolName);
      expect(languages.length).toEqual(0);
    });
  });

  describe('original language tests',()=> {
    beforeEach(() => {
      // reset mock filesystem data
      fs.__resetMockFS();
      fs.__setMockFS({}); // initialize to empty
    });
    afterEach(() => {
      // reset mock filesystem data
      fs.__resetMockFS();
    });

    test('should return an empty list for Genesis (OT, no ULT)', () => {
      const copyFiles = ['en/bibles/ult/v12.1', 'en/translationHelps/translationWords', 'he/bibles/uhb'];
      fs.__loadFilesIntoMockFs(copyFiles, testResourcePath, RESOURCE_PATH);

      const languages = gatewayLanguageHelpers.getGatewayLanguageList('gen');
      expect(languages.length).toEqual(0);
    });

    test('should return an empty list for Luke (NT, no ULT)', () => {
      const copyFiles = ['en/bibles/ult/v12.1', 'en/translationHelps/translationWords', 'grc/bibles/ugnt'];
      fs.__loadFilesIntoMockFs(copyFiles, testResourcePath, RESOURCE_PATH);

      const languages = gatewayLanguageHelpers.getGatewayLanguageList('luk', toolName);
      expect(languages.length).toEqual(0);
    });
  });
});

describe('Test getGatewayLanguageList() for WA',()=>{
  const toolName = 'wordAlignment';

  describe('general tests',()=> {
    beforeEach(() => {
      // reset mock filesystem data
      fs.__resetMockFS();
      fs.__setMockFS({}); // initialize to empty
    });
    afterEach(() => {
      // reset mock filesystem data
      fs.__resetMockFS();
    });

    test('should return English & Hindi for Titus', () => {
      const copyFiles = ['en/bibles/ult/v12.1', 'en/translationHelps/translationWords', 'grc/bibles/ugnt'];
      fs.__loadFilesIntoMockFs(copyFiles, testResourcePath, RESOURCE_PATH);

      // fake a hindi bible
      fakeResourceByCopying(RESOURCE_PATH, 'en/bibles/ult/v12.1', 'hi/bibles/ulb/v12.1');

      const languages = gatewayLanguageHelpers.getGatewayLanguageList('tit', toolName);
      expect(languages[0].name).toEqual('English');
      expect(languages[1].lc).toEqual('hi');
      expect(languages.length).toEqual(2);
    });

    test('should return English for Joel', () => {
      const copyFiles = ['en/bibles/ult/v12.1', 'en/translationHelps/translationWords', 'he/bibles/uhb'];
      fs.__loadFilesIntoMockFs(copyFiles, testResourcePath, RESOURCE_PATH);

      // fake the book of joel
      fakeResourceByCopying(path.join(RESOURCE_PATH, 'en/bibles/ult/v12.1'), 'tit', 'jol');

      const languages = gatewayLanguageHelpers.getGatewayLanguageList('jol', toolName);
      expect(languages[0].name).toEqual('English');
      expect(languages.length).toEqual(1);
    });
  });

  describe('alignment tests',()=> {
    beforeEach(() => {
      // reset mock filesystem data
      fs.__resetMockFS();
      fs.__setMockFS({}); // initialize to empty
    });
    afterEach(() => {
      // reset mock filesystem data
      fs.__resetMockFS();
    });

    test('should default to english for Titus if no alignments', () => {
      const copyFiles = ['en/bibles/ult/v11', 'en/translationHelps/translationWords', 'grc/bibles/ugnt'];
      fs.__loadFilesIntoMockFs(copyFiles, testResourcePath, RESOURCE_PATH);

      const languages = gatewayLanguageHelpers.getGatewayLanguageList('tit', toolName);
      expect(languages[0].name).toEqual('English');
      expect(languages.length).toEqual(1);
    });

    test('should default to english for gal with Hindi (gal is not aligned in en or hi here)', () => {
      const copyFiles = ['en/bibles/ult/v12.1', 'en/translationHelps/translationWords', 'grc/bibles/ugnt'];
      fs.__loadFilesIntoMockFs(copyFiles, testResourcePath, RESOURCE_PATH);

      const languages = gatewayLanguageHelpers.getGatewayLanguageList('gal', toolName);
      expect(languages[0].name).toEqual('English');
      expect(languages.length).toEqual(1);
    });
  });

  describe('checking tests',()=> {
    beforeEach(() => {
      // reset mock filesystem data
      fs.__resetMockFS();
      fs.__setMockFS({}); // initialize to empty
    });
    afterEach(() => {
      // reset mock filesystem data
      fs.__resetMockFS();
    });

    test('should default to english for Titus if ULT not checked', () => {
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

    test('should default to english for Titus if ULT not checking 3', () => {
      const copyFiles = ['en/bibles/ult/v12.1', 'en/translationHelps/translationWords', 'grc/bibles/ugnt'];
      fs.__loadFilesIntoMockFs(copyFiles, testResourcePath, RESOURCE_PATH);
      setCheckingLevel(path.join(RESOURCE_PATH, 'en/bibles/ult/v12.1/manifest.json'), 2);

      const languages = gatewayLanguageHelpers.getGatewayLanguageList('tit', toolName);
      expect(languages[0].name).toEqual('English');
      expect(languages.length).toEqual(1);
    });
  });

  describe('original language tests',()=> {
    beforeEach(() => {
      // reset mock filesystem data
      fs.__resetMockFS();
      fs.__setMockFS({}); // initialize to empty
    });
    afterEach(() => {
      // reset mock filesystem data
      fs.__resetMockFS();
    });

    test('should default to english for Luke (NT, no ULT)', () => {
      const copyFiles = ['en/bibles/ult/v12.1', 'en/translationHelps/translationWords', 'grc/bibles/ugnt'];
      fs.__loadFilesIntoMockFs(copyFiles, testResourcePath, RESOURCE_PATH);

      const languages = gatewayLanguageHelpers.getGatewayLanguageList('luk', toolName);
      expect(languages[0].name).toEqual('English');
      expect(languages.length).toEqual(1);
    });

    test('should default to english for Genesis (OT, no ULT)', () => {
      const copyFiles = ['en/bibles/ult/v12.1', 'en/translationHelps/translationWords', 'he/bibles/uhb'];
      fs.__loadFilesIntoMockFs(copyFiles, testResourcePath, RESOURCE_PATH);

      const languages = gatewayLanguageHelpers.getGatewayLanguageList('gen', toolName);
      expect(languages[0].name).toEqual('English');
      expect(languages.length).toEqual(1);
    });

    test('should default to english for Joel (OT, no ULT)', () => {
      const copyFiles = ['en/bibles/ult/v12.1', 'en/translationHelps/translationWords', 'he/bibles/uhb'];
      fs.__loadFilesIntoMockFs(copyFiles, testResourcePath, RESOURCE_PATH);

      const languages = gatewayLanguageHelpers.getGatewayLanguageList('jol', toolName);
      expect(languages[0].name).toEqual('English');
      expect(languages.length).toEqual(1);
    });
  });
});

//
// helper functions
//

function setupDummyHelps(lang) {
// add dummy resources
  fs.copySync(path.join(RESOURCE_PATH, 'en/translationHelps/translationWords'), path.join(RESOURCE_PATH, lang + '/translationHelps/translationWords'));
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
