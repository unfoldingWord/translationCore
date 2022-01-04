/* eslint-env jest */
import path from 'path-extra';
import fs from 'fs-extra';
// helpers
import ResourceAPI from '../js/helpers/ResourceAPI';
import * as gatewayLanguageHelpers from '../js/helpers/gatewayLanguageHelpers';
import * as ResourcesHelpers from '../js/helpers/ResourcesHelpers';
// constants
import {
  USER_RESOURCES_PATH,
  WORD_ALIGNMENT,
  TRANSLATION_WORDS,
  TRANSLATION_NOTES,
  TRANSLATION_ACADEMY,
  TRANSLATION_HELPS,
} from '../js/common/constants';
jest.mock('fs-extra');
const testResourcePath = path.join(__dirname, 'fixtures/resources');

describe('Test getGatewayLanguageList() for TW',()=>{
  const toolName = TRANSLATION_WORDS;

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
      const copyFiles = ['en/bibles/ult/v12.1_Door43-Catalog', 'en/translationHelps/translationWords', 'el-x-koine'];
      fs.__loadFilesIntoMockFs(copyFiles, testResourcePath, USER_RESOURCES_PATH);

      // fake a hindi bible
      fakeResourceByCopying(USER_RESOURCES_PATH, 'en/bibles/ult', 'hi/bibles/ulb');
      fakeResourceByCopying(USER_RESOURCES_PATH, 'en/translationHelps', 'hi/translationHelps');

      const languages = gatewayLanguageHelpers.getGatewayLanguageList('tit', toolName);
      expect(languages[0].name).toEqual('English');
      expect(languages[1].lc).toEqual('hi');
      expect(languages.length).toEqual(2);
    });

    test('should return English for Joel', () => {
      const copyFiles = ['en/bibles/ult/v12.1_Door43-Catalog', 'en/translationHelps/translationWords', 'hbo/bibles/uhb', 'el-x-koine'];
      fs.__loadFilesIntoMockFs(copyFiles, testResourcePath, USER_RESOURCES_PATH);
      fakeHelpsByCopying('el-x-koine', 'hbo');

      // fake the book of Joel
      fakeResourceByCopying(path.join(USER_RESOURCES_PATH, 'en/bibles/ult/v12.1_Door43-Catalog'), 'tit', 'jol');
      fakeResourceByCopying(path.join(USER_RESOURCES_PATH, 'hbo/translationHelps/translationWords/v8_Door43-Catalog/kt/groups'), 'tit', 'jol');

      const languages = gatewayLanguageHelpers.getGatewayLanguageList('jol', toolName);
      expect(languages[0].name).toEqual('English');
      expect(languages.length).toEqual(1);
    });

    test('should return English for Joel with unaligned hi', () => {
      const copyFiles = ['en/bibles/ult/v12.1_Door43-Catalog', 'en/translationHelps/translationWords', 'hbo/bibles/uhb', 'el-x-koine'];
      fs.__loadFilesIntoMockFs(copyFiles, testResourcePath, USER_RESOURCES_PATH);
      fakeHelpsByCopying('el-x-koine', 'hbo');

      // fake the book of joel
      fakeResourceByCopying(path.join(USER_RESOURCES_PATH, 'en/bibles/ult/v12.1_Door43-Catalog'), 'tit', 'jol');
      fakeHelpsBookByCopying('hbo', 'tit', 'jol');
      // fake a hindi bible
      fakeResourceByCopying(USER_RESOURCES_PATH, 'en/bibles/ult/v12.1_Door43-Catalog', 'hi/bibles/irv/v12.1_Door43-Catalog');
      fs.outputJsonSync(path.join(USER_RESOURCES_PATH, 'hi/bibles/irv/v12.1_Door43-Catalog/jol/1.json'), {}); // remove alignments

      const languages = gatewayLanguageHelpers.getGatewayLanguageList('jol', toolName);
      expect(languages[0].name).toEqual('English');
      expect(languages.length).toEqual(1);
    });

    test('should return nothing for Joel without hbo tWords', () => {
      const copyFiles = ['en/bibles/ult/v12.1_Door43-Catalog', 'en/translationHelps/translationWords', 'hbo/bibles/uhb'];
      fs.__loadFilesIntoMockFs(copyFiles, testResourcePath, USER_RESOURCES_PATH);

      // fake the book of joel
      fakeResourceByCopying(path.join(USER_RESOURCES_PATH, 'en/bibles/ult/v12.1_Door43-Catalog'), 'tit', 'jol');
      // fake a hindi bible
      fakeResourceByCopying(USER_RESOURCES_PATH, 'en/bibles/ult/v12.1_Door43-Catalog', 'hi/bibles/irv/v12.1_Door43-Catalog');
      fs.outputJsonSync(path.join(USER_RESOURCES_PATH, 'hi/bibles/irv/v12.1_Door43-Catalog/jol/1.json'), {}); // remove alignments

      const languages = gatewayLanguageHelpers.getGatewayLanguageList('jol', toolName);
      expect(languages.length).toEqual(0);
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
      const copyFiles = ['en/bibles/ult/v12.1_Door43-Catalog', 'en/translationHelps/translationWords', 'el-x-koine/bibles/ugnt'];
      fs.__loadFilesIntoMockFs(copyFiles, testResourcePath, USER_RESOURCES_PATH);
      const jsonPath = path.join(USER_RESOURCES_PATH, 'en/bibles/ult/v12.1_Door43-Catalog/manifest.json');
      const json = fs.readJSONSync(jsonPath);
      delete json['checking'];
      fs.outputJsonSync(jsonPath, json);

      const languages = gatewayLanguageHelpers.getGatewayLanguageList('tit', toolName);
      expect(languages.length).toEqual(0);
    });

    test('should return an empty list for Titus if ULT not checking 3', () => {
      const copyFiles = ['en/bibles/ult/v12.1_Door43-Catalog', 'en/translationHelps/translationWords', 'el-x-koine/bibles/ugnt'];
      fs.__loadFilesIntoMockFs(copyFiles, testResourcePath, USER_RESOURCES_PATH);
      setCheckingLevel(path.join(USER_RESOURCES_PATH, 'en/bibles/ult/v12.1_Door43-Catalog/manifest.json'), 2);

      const languages = gatewayLanguageHelpers.getGatewayLanguageList('tit', toolName);
      expect(languages.length).toEqual(0);
    });

    test('should return an empty list for Titus if UGNT not checking 2', () => {
      const copyFiles = ['en/bibles/ult/v12.1_Door43-Catalog', 'en/translationHelps/translationWords', 'el-x-koine/bibles/ugnt'];
      fs.__loadFilesIntoMockFs(copyFiles, testResourcePath, USER_RESOURCES_PATH);
      const ugntVersionPath = ResourceAPI.getLatestVersion(path.join(USER_RESOURCES_PATH, 'el-x-koine/bibles/ugnt'));
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
      const copyFiles = ['en/bibles/ult/v12.1', 'en/translationHelps/translationWords', 'hbo/bibles/uhb'];
      fs.__loadFilesIntoMockFs(copyFiles, testResourcePath, USER_RESOURCES_PATH);

      const languages = gatewayLanguageHelpers.getGatewayLanguageList('gen');
      expect(languages.length).toEqual(0);
    });

    test('should return an empty list for Luke (NT, no ULT)', () => {
      const copyFiles = ['en/bibles/ult/v12.1', 'en/translationHelps/translationWords', 'el-x-koine/bibles/ugnt'];
      fs.__loadFilesIntoMockFs(copyFiles, testResourcePath, USER_RESOURCES_PATH);

      const languages = gatewayLanguageHelpers.getGatewayLanguageList('luk', toolName);
      expect(languages.length).toEqual(0);
    });
  });
});

describe('Test getGatewayLanguageList() for TN',()=>{
  const toolName = TRANSLATION_NOTES;

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
      const copyFiles = ['en/bibles/ult/v12.1_Door43-Catalog', 'en/translationHelps', 'el-x-koine'];
      fs.__loadFilesIntoMockFs(copyFiles, testResourcePath, USER_RESOURCES_PATH);

      // fake a hindi bible
      fakeResourceByCopying(USER_RESOURCES_PATH, 'en/bibles/ult', 'hi/bibles/ulb');
      fakeResourceByCopying(USER_RESOURCES_PATH, 'en/translationHelps', 'hi/translationHelps');

      const languages = gatewayLanguageHelpers.getGatewayLanguageList('tit', toolName);
      expect(languages[0].name).toEqual('English');
      expect(languages[1].lc).toEqual('hi');
      expect(languages.length).toEqual(2);
    });

    test('should return English for Romans without Hindi tn for book', () => {
      const copyFiles = ['en/bibles/ult/v12.1_Door43-Catalog', 'en/translationHelps', 'el-x-koine'];
      fs.__loadFilesIntoMockFs(copyFiles, testResourcePath, USER_RESOURCES_PATH);
      fakeHelpsBookByCopying('en', 'tit', 'rom', TRANSLATION_NOTES);
      fakeResourceByCopying(path.join(USER_RESOURCES_PATH, 'en/bibles/ult/v12.1_Door43-Catalog'), 'tit', 'rom');
      fakeResourceByCopying(path.join(USER_RESOURCES_PATH, 'el-x-koine/bibles/ugnt/v0.2_Door43-Catalog'), 'tit', 'rom');

      // fake a hindi bible
      fakeResourceByCopying(USER_RESOURCES_PATH, 'en/bibles/ult', 'hi/bibles/ulb');
      fakeResourceByCopying(USER_RESOURCES_PATH, 'en/translationHelps', 'hi/translationHelps');
      removeBookFromGroups(path.join(USER_RESOURCES_PATH, 'hi/translationHelps/translationNotes/v15_Door43-Catalog'), 'rom'); // remove romans support

      const languages = gatewayLanguageHelpers.getGatewayLanguageList('rom', toolName);
      expect(languages[0].name).toEqual('English');
      expect(languages.length).toEqual(1);
    });

    test('should return English for Joel', () => {
      const copyFiles = ['en/bibles/ult/v12.1_Door43-Catalog', 'en/translationHelps', 'hbo/bibles/uhb', 'el-x-koine'];
      fs.__loadFilesIntoMockFs(copyFiles, testResourcePath, USER_RESOURCES_PATH);
      fakeHelpsByCopying('el-x-koine', 'hbo');
      fakeHelpsByCopying('en', 'hi', TRANSLATION_NOTES);

      // fake the book of Joel
      fakeResourceByCopying(path.join(USER_RESOURCES_PATH, 'en/bibles/ult/v12.1_Door43-Catalog'), 'tit', 'jol');
      fakeResourceByCopying(path.join(USER_RESOURCES_PATH, 'hbo/translationHelps/translationWords/v8_Door43-Catalog/kt/groups'), 'tit', 'jol');
      fakeResourceByCopying(path.join(USER_RESOURCES_PATH, 'en/translationHelps/translationNotes/v15_Door43-Catalog/culture/groups'), 'tit', 'jol');

      const languages = gatewayLanguageHelpers.getGatewayLanguageList('jol', toolName);
      expect(languages[0].name).toEqual('English');
      expect(languages.length).toEqual(1);
    });

    test('should return English for Joel with unaligned hi', () => {
      const copyFiles = ['en/bibles/ult/v12.1_Door43-Catalog', 'en/translationHelps', 'hbo/bibles/uhb', 'el-x-koine'];
      fs.__loadFilesIntoMockFs(copyFiles, testResourcePath, USER_RESOURCES_PATH);
      fakeHelpsByCopying('el-x-koine', 'hbo');
      fakeHelpsByCopying('en', 'hi', TRANSLATION_NOTES);

      // fake the book of joel
      fakeResourceByCopying(path.join(USER_RESOURCES_PATH, 'en/bibles/ult/v12.1_Door43-Catalog'), 'tit', 'jol');
      fakeResourceByCopying(path.join(USER_RESOURCES_PATH, 'en/translationHelps/translationNotes/v15_Door43-Catalog/culture/groups'), 'tit', 'jol');
      fakeHelpsBookByCopying('hbo', 'tit', 'jol');
      // fake a hindi bible
      fakeResourceByCopying(USER_RESOURCES_PATH, 'en/bibles/ult/v12.1_Door43-Catalog', 'hi/bibles/irv/v12.1_Door43-Catalog');
      fs.outputJsonSync(path.join(USER_RESOURCES_PATH, 'hi/bibles/irv/v12.1_Door43-Catalog/jol/1.json'), {}); // remove alignments

      const languages = gatewayLanguageHelpers.getGatewayLanguageList('jol', toolName);
      expect(languages[0].name).toEqual('English');
      expect(languages.length).toEqual(1);
    });

    test('should return nothing for Joel without en TA', () => {
      const copyFiles = ['en/bibles/ult/v12.1_Door43-Catalog', 'en/translationHelps', 'hbo/bibles/uhb'];
      fs.__loadFilesIntoMockFs(copyFiles, testResourcePath, USER_RESOURCES_PATH);
      fs.removeSync(path.join(USER_RESOURCES_PATH, 'en/translationHelps', TRANSLATION_ACADEMY));

      // fake the book of joel
      fakeResourceByCopying(path.join(USER_RESOURCES_PATH, 'en/bibles/ult/v12.1_Door43-Catalog'), 'tit', 'jol');
      fakeHelpsBookByCopying('hbo', 'tit', 'jol');
      // fake a hindi bible
      fakeResourceByCopying(USER_RESOURCES_PATH, 'en/bibles/ult/v12.1_Door43-Catalog', 'hi/bibles/irv/v12.1_Door43-Catalog');
      fs.outputJsonSync(path.join(USER_RESOURCES_PATH, 'hi/bibles/irv/v12.1_Door43-Catalog/jol/1.json'), {}); // remove alignments

      const languages = gatewayLanguageHelpers.getGatewayLanguageList('jol', toolName);
      expect(languages.length).toEqual(0);
    });

    test('should return nothing for Joel without en TN', () => {
      const copyFiles = ['en/bibles/ult/v12.1_Door43-Catalog', 'en/translationHelps', 'hbo/bibles/uhb'];
      fs.__loadFilesIntoMockFs(copyFiles, testResourcePath, USER_RESOURCES_PATH);
      fs.removeSync(path.join(USER_RESOURCES_PATH, 'en/translationHelps', TRANSLATION_NOTES));

      // fake the book of joel
      fakeResourceByCopying(path.join(USER_RESOURCES_PATH, 'en/bibles/ult/v12.1_Door43-Catalog'), 'tit', 'jol');
      fakeHelpsBookByCopying('hbo', 'tit', 'jol');
      // fake a hindi bible
      fakeResourceByCopying(USER_RESOURCES_PATH, 'en/bibles/ult/v12.1_Door43-Catalog', 'hi/bibles/irv/v12.1_Door43-Catalog');
      fs.outputJsonSync(path.join(USER_RESOURCES_PATH, 'hi/bibles/irv/v12.1_Door43-Catalog/jol/1.json'), {}); // remove alignments

      const languages = gatewayLanguageHelpers.getGatewayLanguageList('jol', toolName);
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
      const copyFiles = ['en/bibles/ult/v12.1', 'en/translationHelps/translationWords', 'hbo/bibles/uhb'];
      fs.__loadFilesIntoMockFs(copyFiles, testResourcePath, USER_RESOURCES_PATH);

      const languages = gatewayLanguageHelpers.getGatewayLanguageList('gen');
      expect(languages.length).toEqual(0);
    });

    test('should return an empty list for Luke (NT, no ULT)', () => {
      const copyFiles = ['en/bibles/ult/v12.1', 'en/translationHelps/translationWords', 'el-x-koine/bibles/ugnt'];
      fs.__loadFilesIntoMockFs(copyFiles, testResourcePath, USER_RESOURCES_PATH);

      const languages = gatewayLanguageHelpers.getGatewayLanguageList('luk', toolName);
      expect(languages.length).toEqual(0);
    });
  });
});

describe('Test getGatewayLanguageList() for WA',()=>{
  const toolName = WORD_ALIGNMENT;

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

    test('should return all GL resources w/ lexicons', () => {
      const copyFiles = ['en/bibles/ult/v12.1_Door43-Catalog', 'en/translationHelps/translationWords', 'el-x-koine/bibles/ugnt', 'en/lexicons', 'hi/lexicons'];
      fs.__loadFilesIntoMockFs(copyFiles, testResourcePath, USER_RESOURCES_PATH);

      // fake a hindi bible
      fakeResourceByCopying(USER_RESOURCES_PATH, 'en/bibles/ult/v12.1_Door43-Catalog', 'hi/bibles/ulb/v12.1_Door43-Catalog');

      const languages = gatewayLanguageHelpers.getGatewayLanguageList('tit', toolName);
      expect(languages[0].name).toEqual('English');
      expect(languages.length).toEqual(2);
    });

    test('should return English for Joel', () => {
      const copyFiles = ['en/bibles/ult/v12.1_Door43-Catalog', 'en/translationHelps/translationWords', 'hbo/bibles/uhb'];
      fs.__loadFilesIntoMockFs(copyFiles, testResourcePath, USER_RESOURCES_PATH);

      // fake the book of joel
      fakeResourceByCopying(path.join(USER_RESOURCES_PATH, 'en/bibles/ult/v12.1_Door43-Catalog'), 'tit', 'jol');

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
      const copyFiles = ['en/bibles/ult/v11_Door43-Catalog', 'en/translationHelps/translationWords', 'el-x-koine/bibles/ugnt'];
      fs.__loadFilesIntoMockFs(copyFiles, testResourcePath, USER_RESOURCES_PATH);

      const languages = gatewayLanguageHelpers.getGatewayLanguageList('tit', toolName);
      expect(languages[0].name).toEqual('English');
      expect(languages.length).toEqual(1);
    });

    test('should default to english for gal with Hindi (gal is not aligned in en or hi here)', () => {
      const copyFiles = ['en/bibles/ult/v12.1_Door43-Catalog', 'en/translationHelps/translationWords', 'el-x-koine/bibles/ugnt'];
      fs.__loadFilesIntoMockFs(copyFiles, testResourcePath, USER_RESOURCES_PATH);

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
      const copyFiles = ['en/bibles/ult/v12.1_Door43-Catalog', 'en/translationHelps/translationWords', 'el-x-koine/bibles/ugnt'];
      fs.__loadFilesIntoMockFs(copyFiles, testResourcePath, USER_RESOURCES_PATH);
      const jsonPath = path.join(USER_RESOURCES_PATH, 'en/bibles/ult/v12.1_Door43-Catalog/manifest.json');
      const json = fs.readJSONSync(jsonPath);
      delete json['checking'];
      fs.outputJsonSync(jsonPath, json);

      const languages = gatewayLanguageHelpers.getGatewayLanguageList('tit', toolName);
      expect(languages[0].name).toEqual('English');
      expect(languages.length).toEqual(1);
    });

    test('should default to english for Titus if ULT not checking 3', () => {
      const copyFiles = ['en/bibles/ult/v12.1_Door43-Catalog', 'en/translationHelps/translationWords', 'el-x-koine/bibles/ugnt'];
      fs.__loadFilesIntoMockFs(copyFiles, testResourcePath, USER_RESOURCES_PATH);
      setCheckingLevel(path.join(USER_RESOURCES_PATH, 'en/bibles/ult/v12.1_Door43-Catalog/manifest.json'), 2);

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
      const copyFiles = ['en/bibles/ult/v12.1_Door43-Catalog', 'en/translationHelps/translationWords', 'el-x-koine/bibles/ugnt'];
      fs.__loadFilesIntoMockFs(copyFiles, testResourcePath, USER_RESOURCES_PATH);

      const languages = gatewayLanguageHelpers.getGatewayLanguageList('luk', toolName);
      expect(languages[0].name).toEqual('English');
      expect(languages.length).toEqual(1);
    });

    test('should default to english for Genesis (OT, no ULT)', () => {
      const copyFiles = ['en/bibles/ult/v12.1_Door43-Catalog', 'en/translationHelps/translationWords', 'hbo/bibles/uhb'];
      fs.__loadFilesIntoMockFs(copyFiles, testResourcePath, USER_RESOURCES_PATH);

      const languages = gatewayLanguageHelpers.getGatewayLanguageList('gen', toolName);
      expect(languages[0].name).toEqual('English');
      expect(languages.length).toEqual(1);
    });

    test('should default to english for Joel (OT, no ULT)', () => {
      const copyFiles = ['en/bibles/ult/v12.1_Door43-Catalog', 'en/translationHelps/translationWords', 'hbo/bibles/uhb'];
      fs.__loadFilesIntoMockFs(copyFiles, testResourcePath, USER_RESOURCES_PATH);

      const languages = gatewayLanguageHelpers.getGatewayLanguageList('jol', toolName);
      expect(languages[0].name).toEqual('English');
      expect(languages.length).toEqual(1);
    });
  });
});

describe('gatewayLanguageHelpers.getAlignedGLText', () => {
  const verseObjects = [
    {
      tag: 'zaln',
      type: 'milestone',
      strong: 'G14870',
      lemma: 'εἰ',
      morph: 'Gr,CS,,,,,,,,',
      occurrence: 1,
      occurrences: 1,
      content: 'εἴ',
      children: [
        {
          tag: 'zaln',
          type: 'milestone',
          strong: 'G51000',
          lemma: 'τις',
          morph: 'Gr,RI,,,,NMS,',
          occurrence: 1,
          occurrences: 1,
          content: 'τίς',
          children: [
            {
              text: 'An',
              tag: 'w',
              type: 'word',
              occurrence: 1,
              occurrences: 1,
            },
            {
              text: 'elder',
              tag: 'w',
              type: 'word',
              occurrence: 1,
              occurrences: 1,
            },
          ],
        },
      ],
    },
    {
      tag: 'zaln',
      type: 'milestone',
      strong: 'G15100',
      lemma: 'εἰμί',
      morph: 'Gr,V,IPA3,,S,',
      occurrence: 1,
      occurrences: 1,
      content: 'ἐστιν',
      children: [
        {
          text: 'must',
          tag: 'w',
          type: 'word',
          occurrence: 1,
          occurrences: 1,
        },
        {
          text: 'be',
          tag: 'w',
          type: 'word',
          occurrence: 1,
          occurrences: 1,
        },
      ],
    },
    {
      tag: 'zaln',
      type: 'milestone',
      strong: 'G04100',
      lemma: 'ἀνέγκλητος',
      morph: 'Gr,NP,,,,NMS,',
      occurrence: 1,
      occurrences: 1,
      content: 'ἀνέγκλητος',
      children: [
        {
          text: 'without',
          tag: 'w',
          type: 'word',
          occurrence: 1,
          occurrences: 1,
        },
        {
          text: 'blame',
          tag: 'w',
          type: 'word',
          occurrence: 1,
          occurrences: 1,
        },
      ],
    },
    {
      type: 'text',
      text: ',',
    },
    {
      tag: 'zaln',
      type: 'milestone',
      strong: 'G04350',
      lemma: 'ἀνήρ',
      morph: 'Gr,N,,,,,NMS,',
      occurrence: 1,
      occurrences: 1,
      content: 'ἀνήρ',
      children: [
        {
          text: 'the',
          tag: 'w',
          type: 'word',
          occurrence: 1,
          occurrences: 1,
        },
        {
          text: 'husband',
          tag: 'w',
          type: 'word',
          occurrence: 1,
          occurrences: 1,
        },
      ],
    },
    {
      tag: 'zaln',
      type: 'milestone',
      strong: 'G15200',
      lemma: 'εἷς',
      morph: 'Gr,EN,,,,GFS,',
      occurrence: 1,
      occurrences: 1,
      content: 'μιᾶς',
      children: [
        {
          text: 'of',
          tag: 'w',
          type: 'word',
          occurrence: 1,
          occurrences: 2,
        },
        {
          text: 'one',
          tag: 'w',
          type: 'word',
          occurrence: 1,
          occurrences: 1,
        },
      ],
    },
    {
      tag: 'zaln',
      type: 'milestone',
      strong: 'G11350',
      lemma: 'γυνή',
      morph: 'Gr,N,,,,,GFS,',
      occurrence: 1,
      occurrences: 1,
      content: 'γυναικὸς',
      children: [
        {
          text: 'wife',
          tag: 'w',
          type: 'word',
          occurrence: 1,
          occurrences: 1,
        },
      ],
    },
    {
      type: 'text',
      text: ',',
    },
    {
      tag: 'zaln',
      type: 'milestone',
      strong: 'G21920',
      lemma: 'ἔχω',
      morph: 'Gr,V,PPA,NMS,',
      occurrence: 1,
      occurrences: 1,
      content: 'ἔχων',
      children: [
        {
          text: 'with',
          tag: 'w',
          type: 'word',
          occurrence: 1,
          occurrences: 1,
        },
      ],
    },
    {
      tag: 'zaln',
      type: 'milestone',
      strong: 'G41030',
      lemma: 'πιστός',
      morph: 'Gr,NS,,,,ANP,',
      occurrence: 1,
      occurrences: 1,
      content: 'πιστά',
      children: [
        {
          text: 'faithful',
          tag: 'w',
          type: 'word',
          occurrence: 1,
          occurrences: 1,
        },
      ],
    },
    {
      tag: 'zaln',
      type: 'milestone',
      strong: 'G50430',
      lemma: 'τέκνον',
      morph: 'Gr,N,,,,,ANP,',
      occurrence: 1,
      occurrences: 1,
      content: 'τέκνα',
      children: [
        {
          text: 'children',
          tag: 'w',
          type: 'word',
          occurrence: 1,
          occurrences: 1,
        },
      ],
    },
    {
      tag: 'zaln',
      type: 'milestone',
      strong: 'G33610',
      lemma: 'μή',
      morph: 'Gr,D,,,,,,,,,',
      occurrence: 1,
      occurrences: 1,
      content: 'μὴ',
      children: [
        {
          text: 'not',
          tag: 'w',
          type: 'word',
          occurrence: 1,
          occurrences: 1,
        },
      ],
    },
    {
      tag: 'zaln',
      type: 'milestone',
      strong: 'G17220',
      lemma: 'ἐν',
      morph: 'Gr,P,,,,,D,,,',
      occurrence: 1,
      occurrences: 1,
      content: 'ἐν',
      children: [
        {
          tag: 'zaln',
          type: 'milestone',
          strong: 'G27240',
          lemma: 'κατηγορία',
          morph: 'Gr,N,,,,,DFS,',
          occurrence: 1,
          occurrences: 1,
          content: 'κατηγορίᾳ',
          children: [
            {
              text: 'accused',
              tag: 'w',
              type: 'word',
              occurrence: 1,
              occurrences: 1,
            },
          ],
        },
      ],
    },
    {
      tag: 'zaln',
      type: 'milestone',
      strong: 'G08100',
      lemma: 'ἀσωτία',
      morph: 'Gr,N,,,,,GFS,',
      occurrence: 1,
      occurrences: 1,
      content: 'ἀσωτίας',
      children: [
        {
          text: 'of',
          tag: 'w',
          type: 'word',
          occurrence: 2,
          occurrences: 2,
        },
        {
          text: 'reckless',
          tag: 'w',
          type: 'word',
          occurrence: 1,
          occurrences: 1,
        },
        {
          text: 'behavior',
          tag: 'w',
          type: 'word',
          occurrence: 1,
          occurrences: 1,
        },
      ],
    },
    {
      tag: 'zaln',
      type: 'milestone',
      strong: 'G22280',
      lemma: 'ἤ',
      morph: 'Gr,CC,,,,,,,,',
      occurrence: 1,
      occurrences: 1,
      content: 'ἢ',
      children: [
        {
          text: 'or',
          tag: 'w',
          type: 'word',
          occurrence: 1,
          occurrences: 1,
        },
      ],
    },
    {
      tag: 'zaln',
      type: 'milestone',
      strong: 'G05060',
      lemma: 'ἀνυπότακτος',
      morph: 'Gr,NP,,,,ANP,',
      occurrence: 1,
      occurrences: 1,
      content: 'ἀνυπότακτα',
      children: [
        {
          text: 'undisciplined',
          tag: 'w',
          type: 'word',
          occurrence: 1,
          occurrences: 1,
        },
      ],
    },
    {
      type: 'text',
      text: '. \n',
    },
  ];

  test('should return text from ult and NOT the ulb', () => {
    // given
    const toolsSelectedGLs = {
      translationWords: 'en',
      currentToolName: TRANSLATION_WORDS,
    };
    const contextId = {
      groupId: 'blameless',
      occurrence: 1,
      quote: 'ἀνέγκλητος',
      reference: {
        bookId: 'tit',
        chapter: 1,
        verse: 6,
      },
      strong: ['G04100'],
      tool: TRANSLATION_WORDS,
    };
    const bibles = {
      en: {
        'ult': { 1: { 6: { verseObjects: verseObjects } } },
        'ulb': [],
      },
    };
    const currentToolName = TRANSLATION_WORDS;
    const expectedAlignedGLText = 'without blame';

    // when
    const alignedGLText = gatewayLanguageHelpers.getAlignedGLText(toolsSelectedGLs, contextId, bibles, currentToolName);

    // then
    expect(alignedGLText).toEqual(expectedAlignedGLText);
  });

  test('should return text from ulb', () => {
    // given
    const toolsSelectedGLs = {
      translationWords: 'en',
      currentToolName: TRANSLATION_WORDS,
    };
    const contextId = {
      groupId: 'blameless',
      occurrence: 1,
      quote: 'ἀνέγκλητος',
      reference: {
        bookId: 'tit',
        chapter: 1,
        verse: 6,
      },
      strong: ['G04100'],
      tool: TRANSLATION_WORDS,
    };
    const bibles = { en: { 'ulb': { 1: { 6: { verseObjects: verseObjects } } } } };
    const currentToolName = TRANSLATION_WORDS;
    const expectedAlignedGLText = 'without blame';

    // when
    const alignedGLText = gatewayLanguageHelpers.getAlignedGLText(toolsSelectedGLs, contextId, bibles, currentToolName);

    // then
    expect(alignedGLText).toEqual(expectedAlignedGLText);
  });

  test('should handle array of words for quote', () => {
    // given
    const verseObjects = [
      {
        'tag': 'zaln',
        'type': 'milestone',
        'strong': 'G24430',
        'lemma': 'ἵνα',
        'morph': 'Gr,CS,,,,,,,,',
        'occurrence': 1,
        'occurrences': 1,
        'content': 'ἵνα',
        'children': [
          {
            'text': 'that',
            'tag': 'w',
            'type': 'word',
            'occurrence': 1,
            'occurrences': 1,
          },
        ],
        'endTag': 'zaln-e\\*',
      },
      {
        'tag': 'zaln',
        'type': 'milestone',
        'strong': 'G20680',
        'lemma': 'ἐσθίω',
        'morph': 'Gr,V,SPA2,,P,',
        'occurrence': 1,
        'occurrences': 1,
        'content': 'ἔσθητε',
        'children': [
          {
            'text': 'you',
            'tag': 'w',
            'type': 'word',
            'occurrence': 1,
            'occurrences': 2,
          },
          {
            'text': 'may',
            'tag': 'w',
            'type': 'word',
            'occurrence': 1,
            'occurrences': 1,
          },
          {
            'text': 'eat',
            'tag': 'w',
            'type': 'word',
            'occurrence': 1,
            'occurrences': 1,
          },
        ],
        'endTag': 'zaln-e\\*',
      },
      {
        'tag': 'zaln',
        'type': 'milestone',
        'strong': 'G25320',
        'lemma': 'καί',
        'morph': 'Gr,CC,,,,,,,,',
        'occurrence': 1,
        'occurrences': 2,
        'content': 'καὶ',
        'children': [
          {
            'text': 'and',
            'tag': 'w',
            'type': 'word',
            'occurrence': 1,
            'occurrences': 2,
          },
        ],
        'endTag': 'zaln-e\\*',
      },
      {
        'tag': 'zaln',
        'type': 'milestone',
        'strong': 'G40950',
        'lemma': 'πίνω',
        'morph': 'Gr,V,SPA2,,P,',
        'occurrence': 1,
        'occurrences': 1,
        'content': 'πίνητε',
        'children': [
          {
            'text': 'drink',
            'tag': 'w',
            'type': 'word',
            'occurrence': 1,
            'occurrences': 1,
          },
        ],
        'endTag': 'zaln-e\\*',
      },
      {
        'tag': 'zaln',
        'type': 'milestone',
        'strong': 'G19090',
        'lemma': 'ἐπί',
        'morph': 'Gr,P,,,,,G,,,',
        'occurrence': 1,
        'occurrences': 2,
        'content': 'ἐπὶ',
        'children': [
          {
            'text': 'at',
            'tag': 'w',
            'type': 'word',
            'occurrence': 1,
            'occurrences': 1,
          },
        ],
        'endTag': 'zaln-e\\*',
      },
      {
        'tag': 'zaln',
        'type': 'milestone',
        'strong': 'G14730',
        'lemma': 'ἐγώ',
        'morph': 'Gr,RP,,,1G,S,',
        'occurrence': 1,
        'occurrences': 2,
        'content': 'μου',
        'children': [
          {
            'text': 'my',
            'tag': 'w',
            'type': 'word',
            'occurrence': 1,
            'occurrences': 2,
          },
        ],
        'endTag': 'zaln-e\\*',
      },
      {
        'tag': 'zaln',
        'type': 'milestone',
        'strong': 'G35880',
        'lemma': 'ὁ',
        'morph': 'Gr,EA,,,,GFS,',
        'occurrence': 1,
        'occurrences': 1,
        'content': 'τῆς',
        'children': [
          {
            'tag': 'zaln',
            'type': 'milestone',
            'strong': 'G51320',
            'lemma': 'τράπεζα',
            'morph': 'Gr,N,,,,,GFS,',
            'occurrence': 1,
            'occurrences': 1,
            'content': 'τραπέζης',
            'children': [
              {
                'text': 'table',
                'tag': 'w',
                'type': 'word',
                'occurrence': 1,
                'occurrences': 1,
              },
            ],
            'endTag': 'zaln-e\\*',
          },
        ],
        'endTag': 'zaln-e\\*',
      },
      {
        'tag': 'zaln',
        'type': 'milestone',
        'strong': 'G17220',
        'lemma': 'ἐν',
        'morph': 'Gr,P,,,,,D,,,',
        'occurrence': 1,
        'occurrences': 1,
        'content': 'ἐν',
        'children': [
          {
            'text': 'in',
            'tag': 'w',
            'type': 'word',
            'occurrence': 1,
            'occurrences': 1,
          },
        ],
        'endTag': 'zaln-e\\*',
      },
      {
        'tag': 'zaln',
        'type': 'milestone',
        'strong': 'G14730',
        'lemma': 'ἐγώ',
        'morph': 'Gr,RP,,,1G,S,',
        'occurrence': 2,
        'occurrences': 2,
        'content': 'μου',
        'children': [
          {
            'text': 'my',
            'tag': 'w',
            'type': 'word',
            'occurrence': 2,
            'occurrences': 2,
          },
        ],
        'endTag': 'zaln-e\\*',
      },
      {
        'tag': 'zaln',
        'type': 'milestone',
        'strong': 'G35880',
        'lemma': 'ὁ',
        'morph': 'Gr,EA,,,,DFS,',
        'occurrence': 1,
        'occurrences': 1,
        'content': 'τῇ',
        'children': [
          {
            'tag': 'zaln',
            'type': 'milestone',
            'strong': 'G09320',
            'lemma': 'βασιλεία',
            'morph': 'Gr,N,,,,,DFS,',
            'occurrence': 1,
            'occurrences': 1,
            'content': 'βασιλείᾳ',
            'children': [
              {
                'text': 'kingdom',
                'tag': 'w',
                'type': 'word',
                'occurrence': 1,
                'occurrences': 1,
              },
            ],
            'endTag': 'zaln-e\\*',
          },
        ],
        'endTag': 'zaln-e\\*',
      },
      {
        'type': 'text',
        'text': ',',
      },
      {
        'tag': 'zaln',
        'type': 'milestone',
        'strong': 'G25320',
        'lemma': 'καί',
        'morph': 'Gr,CC,,,,,,,,',
        'occurrence': 2,
        'occurrences': 2,
        'content': 'καὶ',
        'children': [
          {
            'text': 'and',
            'tag': 'w',
            'type': 'word',
            'occurrence': 2,
            'occurrences': 2,
          },
        ],
        'endTag': 'zaln-e\\*',
      },
      {
        'tag': 'zaln',
        'type': 'milestone',
        'strong': 'G25210',
        'lemma': 'κάθημαι',
        'morph': 'Gr,V,IPM2,,P,',
        'occurrence': 1,
        'occurrences': 1,
        'content': 'καθῆσθε',
        'children': [
          {
            'text': 'you',
            'tag': 'w',
            'type': 'word',
            'occurrence': 2,
            'occurrences': 2,
          },
          {
            'text': 'will',
            'tag': 'w',
            'type': 'word',
            'occurrence': 1,
            'occurrences': 1,
          },
          {
            'text': 'sit',
            'tag': 'w',
            'type': 'word',
            'occurrence': 1,
            'occurrences': 1,
          },
        ],
        'endTag': 'zaln-e\\*',
      },
      {
        'tag': 'zaln',
        'type': 'milestone',
        'strong': 'G19090',
        'lemma': 'ἐπί',
        'morph': 'Gr,P,,,,,G,,,',
        'occurrence': 2,
        'occurrences': 2,
        'content': 'ἐπὶ',
        'children': [
          {
            'text': 'on',
            'tag': 'w',
            'type': 'word',
            'occurrence': 1,
            'occurrences': 1,
          },
        ],
        'endTag': 'zaln-e\\*',
      },
      {
        'tag': 'zaln',
        'type': 'milestone',
        'strong': 'G23620',
        'lemma': 'θρόνος',
        'morph': 'Gr,N,,,,,GMP,',
        'occurrence': 1,
        'occurrences': 1,
        'content': 'θρόνων',
        'children': [
          {
            'text': 'thrones',
            'tag': 'w',
            'type': 'word',
            'occurrence': 1,
            'occurrences': 1,
          },
        ],
        'endTag': 'zaln-e\\*',
      },
      {
        'tag': 'zaln',
        'type': 'milestone',
        'strong': 'G29190',
        'lemma': 'κρίνω',
        'morph': 'Gr,V,PPA,NMP,',
        'occurrence': 1,
        'occurrences': 1,
        'content': 'κρίνοντες',
        'children': [
          {
            'text': 'judging',
            'tag': 'w',
            'type': 'word',
            'occurrence': 1,
            'occurrences': 1,
          },
        ],
        'endTag': 'zaln-e\\*',
      },
      {
        'tag': 'zaln',
        'type': 'milestone',
        'strong': 'G35880',
        'lemma': 'ὁ',
        'morph': 'Gr,EA,,,,AFP,',
        'occurrence': 1,
        'occurrences': 1,
        'content': 'τὰς',
        'children': [
          {
            'text': 'the',
            'tag': 'w',
            'type': 'word',
            'occurrence': 1,
            'occurrences': 1,
          },
        ],
        'endTag': 'zaln-e\\*',
      },
      {
        'tag': 'zaln',
        'type': 'milestone',
        'strong': 'G14270',
        'lemma': 'δώδεκα',
        'morph': 'Gr,EN,,,,AFP,',
        'occurrence': 1,
        'occurrences': 1,
        'content': 'δώδεκα',
        'children': [
          {
            'text': 'twelve',
            'tag': 'w',
            'type': 'word',
            'occurrence': 1,
            'occurrences': 1,
          },
        ],
        'endTag': 'zaln-e\\*',
      },
      {
        'tag': 'zaln',
        'type': 'milestone',
        'strong': 'G54430',
        'lemma': 'φυλή',
        'morph': 'Gr,N,,,,,AFP,',
        'occurrence': 1,
        'occurrences': 1,
        'content': 'φυλὰς',
        'children': [
          {
            'text': 'tribes',
            'tag': 'w',
            'type': 'word',
            'occurrence': 1,
            'occurrences': 1,
          },
        ],
        'endTag': 'zaln-e\\*',
      },
      {
        'tag': 'zaln',
        'type': 'milestone',
        'strong': 'G35880',
        'lemma': 'ὁ',
        'morph': 'Gr,EA,,,,GMS,',
        'occurrence': 1,
        'occurrences': 1,
        'content': 'τοῦ',
        'children': [
          {
            'text': 'of',
            'tag': 'w',
            'type': 'word',
            'occurrence': 1,
            'occurrences': 1,
          },
        ],
        'endTag': 'zaln-e\\*',
      },
      {
        'tag': 'zaln',
        'type': 'milestone',
        'strong': 'G24740',
        'lemma': 'Ἰσραήλ',
        'morph': 'Gr,N,,,,,GMSI',
        'occurrence': 1,
        'occurrences': 1,
        'content': 'Ἰσραήλ',
        'children': [
          {
            'text': 'Israel',
            'tag': 'w',
            'type': 'word',
            'occurrence': 1,
            'occurrences': 1,
          },
        ],
        'endTag': 'zaln-e\\*',
      },
      {
        'type': 'text',
        'text': '.',
      },
      {
        'tag': 's5',
        'nextChar': '\n',
        'type': 'section',
      },
      {
        'tag': 'p',
        'type': 'paragraph',
        'text': ' \n',
      },
    ];
    const toolsSelectedGLs = {
      translationWords: 'en',
      currentToolName: TRANSLATION_WORDS,
    };
    const contextId = {
      'reference': {
        'bookId': 'luk',
        'chapter': 22,
        'verse': 30,
      },
      'tool': TRANSLATION_WORDS,
      'groupId': '12tribesofisrael',
      'quote': [
        {
          'word': 'δώδεκα',
          'occurrence': 1,
        },
        {
          'word': 'φυλὰς',
          'occurrence': 1,
        },
        {
          'word': 'κρίνοντες',
          'occurrence': 1,
        },
        {
          'word': 'τοῦ',
          'occurrence': 1,
        },
        {
          'word': 'Ἰσραήλ',
          'occurrence': 1,
        },
      ],
      'strong': [
        'G14270',
        'G54430',
        'G29190',
        'G35880',
        'G24740',
      ],
      'occurrence': 1,
    };
    const bibles = { en: { 'ult': { 22: { 30: { verseObjects: verseObjects } } } } };
    const currentToolName = TRANSLATION_WORDS;
    const expectedAlignedGLText = 'judging … twelve tribes of Israel';

    // when
    const alignedGLText = gatewayLanguageHelpers.getAlignedGLText(toolsSelectedGLs, contextId, bibles, currentToolName);

    // then
    expect(alignedGLText).toEqual(expectedAlignedGLText);
  });
});

describe('checkAreayHelpers.bibleIdSort', () => {
  test('Test ordering of Bible IDs', () => {
    // given
    const bibleIds = ['asv', 'esv', 'ulb', 'ust', 'ult', 'udb', 'irv', 'aaa', 'zzz'];
    const expectedSortedBibleIds = ['irv', 'ult', 'ulb', 'ust', 'udb', 'aaa', 'asv', 'esv', 'zzz'];

    // when
    const sortedBibleIds = bibleIds.sort(gatewayLanguageHelpers.bibleIdSort);

    // then
    expect(sortedBibleIds).toEqual(expectedSortedBibleIds);
  });
});

//
// helper functions
//

function fakeHelpsByCopying(srcLang, destLang, helpsDir = TRANSLATION_WORDS) {
  // add dummy resources
  fs.copySync(path.join(USER_RESOURCES_PATH, srcLang, TRANSLATION_HELPS, helpsDir), path.join(USER_RESOURCES_PATH, destLang, TRANSLATION_HELPS, helpsDir));
}

function fakeHelpsBookByCopying(lang, srcBook, destBook) {
  // add dummy resources
  const tWHelpsPath = path.join(USER_RESOURCES_PATH, lang, 'translationHelps/translationWords');
  const latestVersionPath = ResourceAPI.getLatestVersion(tWHelpsPath);

  if (latestVersionPath) {
    const subFolders = ResourcesHelpers.getFoldersInResourceFolder(latestVersionPath);

    for (let subFolder of subFolders) {
      const srcPath = path.join(latestVersionPath, subFolder, 'groups');
      const srcBookPath = path.join(srcPath, srcBook);

      if (fs.lstatSync(srcBookPath).isDirectory()) {
        fs.copySync(srcBookPath, path.join(srcPath, destBook));
      }
    }
  }
}

function removeBookFromGroups(helpsPath, bookId) {
  const subFolders = ResourcesHelpers.getFoldersInResourceFolder(helpsPath);

  for (const file of subFolders) {
    const bookPath = path.join(helpsPath, file, 'groups', bookId);

    if (fs.existsSync(bookPath)) {
      fs.removeSync(bookPath);
    }
  }
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
