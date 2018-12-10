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
      const copyFiles = ['en/bibles/ult/v12.1', 'en/translationHelps/translationWords', 'hbo/bibles/uhb'];
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
      const copyFiles = ['en/bibles/ult/v12.1', 'en/translationHelps/translationWords', 'hbo/bibles/uhb'];
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
      const copyFiles = ['en/bibles/ult/v12.1', 'en/translationHelps/translationWords', 'hbo/bibles/uhb'];
      fs.__loadFilesIntoMockFs(copyFiles, testResourcePath, RESOURCE_PATH);

      const languages = gatewayLanguageHelpers.getGatewayLanguageList('gen', toolName);
      expect(languages[0].name).toEqual('English');
      expect(languages.length).toEqual(1);
    });

    test('should default to english for Joel (OT, no ULT)', () => {
      const copyFiles = ['en/bibles/ult/v12.1', 'en/translationHelps/translationWords', 'hbo/bibles/uhb'];
      fs.__loadFilesIntoMockFs(copyFiles, testResourcePath, RESOURCE_PATH);

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
              occurrences: 1
            },
            {
              text: 'elder',
              tag: 'w',
              type: 'word',
              occurrence: 1,
              occurrences: 1
            }
          ]
        }
      ]
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
          occurrences: 1
        },
        {
          text: 'be',
          tag: 'w',
          type: 'word',
          occurrence: 1,
          occurrences: 1
        }
      ]
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
          occurrences: 1
        },
        {
          text: 'blame',
          tag: 'w',
          type: 'word',
          occurrence: 1,
          occurrences: 1
        }
      ]
    },
    {
      type: 'text',
      text: ','
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
          occurrences: 1
        },
        {
          text: 'husband',
          tag: 'w',
          type: 'word',
          occurrence: 1,
          occurrences: 1
        }
      ]
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
          occurrences: 2
        },
        {
          text: 'one',
          tag: 'w',
          type: 'word',
          occurrence: 1,
          occurrences: 1
        }
      ]
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
          occurrences: 1
        }
      ]
    },
    {
      type: 'text',
      text: ','
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
          occurrences: 1
        }
      ]
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
          occurrences: 1
        }
      ]
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
          occurrences: 1
        }
      ]
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
          occurrences: 1
        }
      ]
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
              occurrences: 1
            }
          ]
        }
      ]
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
          occurrences: 2
        },
        {
          text: 'reckless',
          tag: 'w',
          type: 'word',
          occurrence: 1,
          occurrences: 1
        },
        {
          text: 'behavior',
          tag: 'w',
          type: 'word',
          occurrence: 1,
          occurrences: 1
        }
      ]
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
          occurrences: 1
        }
      ]
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
          occurrences: 1
        }
      ]
    },
    {
      type: 'text',
      text: '. \n'
    }
  ];

  test('should return text from ult and NOT the ulb', () => {
    // given
    const currentProjectToolsSelectedGL = {
      translationWords: 'en',
      currentToolName: 'translationWords'
    };
    const contextId = {
      groupId: 'blameless',
      occurrence: 1,
      quote: 'ἀνέγκλητος',
      reference: {
        bookId: 'tit',
        chapter: 1,
        verse: 6
      },
      strong: ['G04100'],
      tool: 'translationWords'
    };
    const bibles = {
      en: {
        'ult': {
          1: {
            6: {
              verseObjects: verseObjects
            }
          }
        },
        'ulb': []
      }
    };
    const currentToolName = 'translationWords';
    const expectedAlignedGLText = 'without blame';

      // when
    const alignedGLText = gatewayLanguageHelpers.getAlignedGLText(currentProjectToolsSelectedGL, contextId, bibles, currentToolName);

    // then
    expect(alignedGLText).toEqual(expectedAlignedGLText);
  });

  test('should return text from ulb', () => {
    // given
    const currentProjectToolsSelectedGL = {
      translationWords: 'en',
      currentToolName: 'translationWords'
    };
    const contextId = {
      groupId: 'blameless',
      occurrence: 1,
      quote: 'ἀνέγκλητος',
      reference: {
        bookId: 'tit',
        chapter: 1,
        verse: 6
      },
      strong: ['G04100'],
      tool: 'translationWords'
    };
    const bibles = {
      en: {
        'ulb': {
          1: {
            6: {
              verseObjects: verseObjects
            }
          }
        }
      }
    };
    const currentToolName = 'translationWords';
    const expectedAlignedGLText = 'without blame';

      // when
    const alignedGLText = gatewayLanguageHelpers.getAlignedGLText(currentProjectToolsSelectedGL, contextId, bibles, currentToolName);

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
  