/* eslint-env jest */
import fs from 'fs-extra';
import path from 'path-extra';
//helpers
import * as WordAlignmentHelpers from '../src/js/helpers/WordAlignmentHelpers';
import * as VerseObjectHelpers from '../src/js/helpers/VerseObjectHelpers';
import { populateOccurrencesInWordObjects } from "../src/js/helpers/WordAlignmentHelpers";
//consts
const RESOURCES = path.join('__tests__', 'fixtures', 'pivotAlignmentVerseObjects');
jest.mock('fs-extra');

describe('WordAlignmentHelpers.sortWordObjectsByString', () => {
  it('should return wordObjectsArray sorted and in order from string', function () {
    const string = 'qwerty asdf zxcv uiop jkl; bnm, qwerty asdf zxcv jkl; bnm,';
    const wordObjectArray = [
      { word: 'zxcv', occurrence: 2, occurrences: 2 },
      { word: 'qwerty', occurrence: 2, occurrences: 2 },
      { word: 'qwerty', occurrence: 1, occurrences: 2 },
      { word: 'zxcv', occurrence: 1, occurrences: 2 }
    ];
    const output = WordAlignmentHelpers.sortWordObjectsByString(wordObjectArray, string);
    const expected = [
      { word: 'qwerty', occurrence: 1, occurrences: 2 },
      { word: 'zxcv', occurrence: 1, occurrences: 2 },
      { word: 'qwerty', occurrence: 2, occurrences: 2 },
      { word: 'zxcv', occurrence: 2, occurrences: 2 }
    ];
    expect(output).toEqual(expected);
  });
  it('should return wordObjectsArray sorted and in order from stringWordObjects', function () {
    const stringData = [
      { word: 'qwerty', occurrence: 1, occurrences: 2, stringData: 0 },
      { word: 'zxcv', occurrence: 1, occurrences: 2, stringData: 0 },
      { word: 'qwerty', occurrence: 2, occurrences: 2, stringData: 0 },
      { word: 'zxcv', occurrence: 2, occurrences: 2, stringData: 0 }
    ];
    const wordObjectArray = [
      { word: 'zxcv', occurrence: 2, occurrences: 2, wordObjectData: 1 },
      { word: 'qwerty', occurrence: 1, occurrences: 2, wordObjectData: 1 }
    ];
    const output = WordAlignmentHelpers.sortWordObjectsByString(wordObjectArray, stringData);
    const expected = [
      { word: 'qwerty', occurrence: 1, occurrences: 2, wordObjectData: 1 },
      { word: 'zxcv', occurrence: 2, occurrences: 2, wordObjectData: 1 }
    ];
    expect(output).toEqual(expected);
  });
});

describe('WordAlignmentHelpers.getAlignmentPathsFromProject', () => {
  const manifest = {
    "project": { "id": "mat" }
  };
  const projectSaveLocation = 'my/amazing/alignments';
  const expectedChapters = ['1.json', '2.json'];
  const recievedChapters = [...expectedChapters, '.DS_Store'];
  const expectedWordAlignmentPath = path.join(projectSaveLocation, '.apps', 'translationCore', 'alignmentData', manifest.project.id);
  const expectedTargetLanguagePath = path.join(projectSaveLocation, manifest.project.id);

  beforeEach(() => {
    // reset mock filesystem data
    fs.__resetMockFS();
    // Set up mock filesystem before each test
    fs.__setMockFS({
      [path.join(projectSaveLocation, 'manifest.json')]: manifest,
      [path.join(projectSaveLocation, manifest.project.id)]: {},
      [expectedWordAlignmentPath]: recievedChapters
    });
  });

  afterEach(() => {
    fs.__resetMockFS();
  });

  it('should retrieve the paths to an alignment project if it exists', () => {
    const { chapters, wordAlignmentDataPath, projectTargetLanguagePath } = WordAlignmentHelpers.getAlignmentPathsFromProject(projectSaveLocation);
    expect(chapters).toEqual(expectedChapters);
    expect(wordAlignmentDataPath).toBe(expectedWordAlignmentPath);
    expect(projectTargetLanguagePath).toBe(expectedTargetLanguagePath);
  });

  it('should not retrieve the paths to an alignment project if it does not exists', () => {
    const nonExistentProject = 'this/project/does/not/exist';
    const { chapters, wordAlignmentDataPath, projectTargetLanguagePath } = WordAlignmentHelpers.getAlignmentPathsFromProject(nonExistentProject);
    expect(chapters).toBe(undefined);
    expect(wordAlignmentDataPath).toBe(undefined);
    expect(projectTargetLanguagePath).toBe(undefined);
  });
});

describe('WordAlignmentHelpers.getAlignmentDataFromPath', () => {

  const projectSaveLocation = 'my/amazing/alignments';
  const chapterFiles = ['1.json', '2.json'];
  const wordAlignmentDataPath = path.join(projectSaveLocation, '.apps', 'translationCore', 'alignmentData', 'tit');
  const projectTargetLanguagePath = path.join(projectSaveLocation, 'tit');

  const expectedChapterAlignmentJSONs = [{ hello: 'hola' }, { 'good morning': 'buenos días' }];
  const expectedTargetLanguageChapterJSONs = [{ hello: 'bonjour' }, { 'translate': 'traduire' }];

  beforeEach(() => {
    // reset mock filesystem data
    fs.__resetMockFS();
    // Set up mock filesystem before each test
    chapterFiles.forEach((chapterFile, index) => {
      fs.outputFileSync(path.join(wordAlignmentDataPath, chapterFile), expectedChapterAlignmentJSONs[index]);
      fs.outputFileSync(path.join(projectTargetLanguagePath, chapterFile), expectedTargetLanguageChapterJSONs[index]);
    });
  });

  it('should get corresponding chpater JSON objects for the target language text and source/target alignments', () => {
    chapterFiles.forEach((chapterFile, index) => {
      let { chapterAlignmentJSON, targetLanguageChapterJSON } = WordAlignmentHelpers.getAlignmentDataFromPath(
        wordAlignmentDataPath, projectTargetLanguagePath, chapterFile
      );
      expect(chapterAlignmentJSON).toEqual(expectedChapterAlignmentJSONs[index]);
      expect(targetLanguageChapterJSON).toEqual(expectedTargetLanguageChapterJSONs[index]);
    });
  });

  it('should not get corresponding chpater JSON objects for the target language text and source/target alignments\
  if they do not exist', () => {
      const chapterFile = '0.json';
      let { chapterAlignmentJSON, targetLanguageChapterJSON } = WordAlignmentHelpers.getAlignmentDataFromPath(
        wordAlignmentDataPath, projectTargetLanguagePath, chapterFile
      );
      expect(chapterAlignmentJSON).toEqual({});
      expect(targetLanguageChapterJSON).toEqual({});
    });
});

describe('WordAlignmentHelpers.setVerseObjectsInAlignmentJSON', () => {
  const verseObjects = [
    {
      tag: "w",
      type: "word",
      text: "hello",
      occurrence: 1,
      occurrences: 1
    },
    {
      tag: "w",
      type: "word",
      text: "world",
      occurrence: 1,
      occurrences: 1
    }
  ];
  const chapterNumber = 1;
  const verseNumber = 2;
  it('should set the verse object in the alignment conversion object', () => {
    const usfmToJSONObject = { chapters: {} };
    WordAlignmentHelpers.setVerseObjectsInAlignmentJSON(
      usfmToJSONObject, chapterNumber, verseNumber, verseObjects
    );
    expect(usfmToJSONObject.chapters[chapterNumber][verseNumber].verseObjects).toEqual(verseObjects);
  });
  it('should set the verse object in the alignment conversion object and set the verse key', () => {
    const usfmToJSONObject = { chapters: { 1: {} } };
    WordAlignmentHelpers.setVerseObjectsInAlignmentJSON(
      usfmToJSONObject, chapterNumber, verseNumber, verseObjects
    );
    expect(usfmToJSONObject.chapters[chapterNumber][verseNumber].verseObjects).toEqual(verseObjects);
  });
  it('should set the verse object in the alignment conversion object and set the chapter and verse key', () => {
    const usfmToJSONObject = { chapters: { 1: { 2: {} } } };
    WordAlignmentHelpers.setVerseObjectsInAlignmentJSON(
      usfmToJSONObject, chapterNumber, verseNumber, verseObjects
    );
    expect(usfmToJSONObject.chapters[chapterNumber][verseNumber].verseObjects).toEqual(verseObjects);
  });
});

describe('WordAlignmentHelpers.writeToFS', () => {
  beforeEach(() => {
    fs.__resetMockFS();
  });
  it('should write an usfm file to the filesystem if it exists', () => {
    const alignmentExportPath = 'path/to/my/aligments.usfm';
    const usfm = `//v In the beginning`;
    WordAlignmentHelpers.writeToFS(alignmentExportPath, usfm);
    expect(fs.readFileSync(alignmentExportPath).toString()).toEqual(usfm);
  });
  it('shouldn\'t write an usfm file to the filesystem if it doesn\'t exist', () => {
    const alignmentExportPath = 'path/to/my/aligments.usfm';
    const usfm = null;
    WordAlignmentHelpers.writeToFS(alignmentExportPath, usfm);
    expect(fs.existsSync(alignmentExportPath)).toBe(false);
  });
  it('shouldn\'t write an usfm object to the filesystem if it is not a string', () => {
    const alignmentExportPath = 'path/to/my/aligments.usfm';
    const usfm = {};
    WordAlignmentHelpers.writeToFS(alignmentExportPath, usfm);
    expect(fs.existsSync(alignmentExportPath)).toBe(false);
  });
});

describe('WordAlignmentHelpers.convertAlignmentDataToUSFM', () => {
  it('shouldn\'t convert alignments from a project that doesn\'t exist', async function () {
    expect.assertions(1);
    try {
      await WordAlignmentHelpers.convertAlignmentDataToUSFM('sdkjl');
    } catch (e) {
      expect(e).toBeTruthy();
    }
  });

  it('should convert alignments from a project that does exist', async function () {
    const testFilesPath = path.join('__tests__', 'fixtures', 'pivotAlignmentVerseObjects');
    const mockAlignmentFixture = fs.__actual.readJSONSync(path.join(testFilesPath, 'tit1-1.json'));
    //todo: use usfm output from here once #3186 is finished.
    //const expectedConvertedUSFM3 = fs.readFileSync('my/mock/alignments/tit1-1.usfm');
    const chapterFiles = ['1.json'];
    const wordAlignmentData = {
      1: {
        alignments: mockAlignmentFixture.alignment,
        wordBank: mockAlignmentFixture.wordBank
      }
    };
    const targetLangauageData = {
      1: mockAlignmentFixture.verseString
    };
    const wordAlignmentDataPath = 'path/to/wordalignments';
    const targetLanguageDataPath = 'path/to/targetLanguage';

    // Set up mock filesystem before each test
    fs.outputFileSync(path.join(wordAlignmentDataPath, chapterFiles[0]), wordAlignmentData);
    fs.outputFileSync(path.join(targetLanguageDataPath, chapterFiles[0]), targetLangauageData);
    fs.__loadFilesIntoMockFs(['manifest.json'], testFilesPath, targetLanguageDataPath);

    const usfm = await WordAlignmentHelpers.convertAlignmentDataToUSFM(wordAlignmentDataPath, targetLanguageDataPath, chapterFiles, targetLanguageDataPath);
    const foundMatch = usfm.includes('\\zaln-s | x-strong="G25960" x-lemma="κατά" x-morph="Gr,P,,,,,A,,," x-occurrence="1" x-occurrences="1" x-content="κατ’"');
    expect(foundMatch).toBeTruthy();
  });
});

describe('WordAlignmentHelpers.checkVerseForChanges', () => {
  const bookId = 'matt';
  const chapter = 1;
  let verse = 1;
  const verseObjects = require(`./fixtures/verseObjects/${bookId}${chapter}-${verse}.json`);
  const { alignment, wordBank, verseString } = require(`./fixtures/pivotAlignmentVerseObjects/${bookId}${chapter}-${verse}a.json`);
  const verseAlignments = { alignments: alignment, wordBank };
  it('should not find a change in the saved alignments from the data on file', () => {
    expect(WordAlignmentHelpers.checkVerseForChanges(verseAlignments, { verseObjects }, verseString)).toEqual(
      { "alignmentChangesType": null, "alignmentsInvalid": false, showDialog: true }
    );
  });
  it('should find a change in the saved alignments from the data on file', () => {
    expect(WordAlignmentHelpers.checkVerseForChanges(verseAlignments, { verseObjects }, 'Some changed verse.')).toEqual(
      { "alignmentChangesType": 'target language', "alignmentsInvalid": true, showDialog: true }
    );
  });
});

describe('Should check checkVerseForChanges in many different types of use cases', () => {
  it('should check for verse changes with alignments that are many to one', () => {
    checkForChangesTest('manyToOne');
  });
  it('should check for verse changes with alignments that are many to many', () => {
    checkForChangesTest('manyToMany');
  });
  it('should check for verse changes with alignments that are one to many', () => {
    checkForChangesTest('oneToMany');
  });
  it('should check for verse changes with alignments that are one to none', () => {
    checkForChangesTest('oneToNone', false);
  });
  it('should check for verse changes with alignments that are one to one', () => {
    checkForChangesTest('oneToOne');
  });
  it('should check for verse changes with alignments that are non contiguous and contiguous', () => {
    checkForChangesTest('contiguousAndNonContiguous');
  });
  it('should check for verse changes with alignments that are out of order', () => {
    checkForChangesTest('outOfOrder');
  });
  it('should check for verse changes with alignments that are non contiguous', () => {
    checkForChangesTest('noncontiguous');
  });
  it('should check for verse changes with alignments that are from matt 1-1', () => {
    checkForChangesTest('matt1-1');
  });
  it('should check for verse changes with alignments that are from matt 1-1a', () => {
    checkForChangesTest('matt1-1a');
  });
  it('should check for verse changes with alignments that are from matt 1-1b', () => {
    checkForChangesTest('matt1-1b');
  });
  it('should check for verse changes with alignments that are from tit-1-1', () => {
    checkForChangesTest('tit1-1');
  });
});

/**
 * Reads a usfm file from the resources dir
 * @param {string} filePath relative path to usfm file
 * @return {string} sdv
 */
const readJSON = filename => {
  const fullPath = path.join(RESOURCES, filename);
  if (fs.__actual.existsSync(fullPath)) {
    const json = fs.__actual.readJsonSync(fullPath);
    return json;
  } else {
    console.log('File not found.');
    return false;
  }
};

const createMockGreekVerseObjectsFromString = (alignedString) => {
  alignedString = alignedString.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");
  return alignedString.split(' ')
    .map((word) => {
      return {
        text: word,
        tag: "w",
        type: "word"
      };
    });
};

/**
 * Generator for testing merging of alignment into verseObjects
 * @param {string} name - the name of the test files to use. e.g. `valid` will test `valid.usfm` to `valid.json`
 */
const checkForChangesTest = (name = {}, showDialog = true) => {
  const json = readJSON(`${name}.json`);
  expect(json).toBeTruthy();
  const { alignment, verseString, wordBank, alignedVerseString } = json;
  const verseAlignments = { alignments: alignment, wordBank };
  let verseObjects = createMockGreekVerseObjectsFromString(alignedVerseString);
  expect(WordAlignmentHelpers.checkVerseForChanges(verseAlignments, { verseObjects }, verseString)).toEqual(
    { "alignmentChangesType": null, "alignmentsInvalid": false, showDialog }
  );
};

describe('WordAlignmentHelpers.getTargetLanguageVerse', () => {
  const targetLanguageVerse = "ते बरदाश्त केरने बैली, पवित्र, घरेरो कारोबार केरने बैल्ली, भलाई केरने बैली ते अपने अपने मुन्शाँ केरे आधीन रहने बैली भोंन, ताकि परमेशरेरे वचनेरी निन्दा न भोए|";
  const expectedOutput = "ते बरदाश्त केरने बैली पवित्र घरेरो कारोबार केरने बैल्ली भलाई केरने बैली ते अपने अपने मुन्शाँ केरे आधीन रहने बैली भोंन ताकि परमेशरेरे वचनेरी निन्दा न भोए";
  it('should parse the target language correctly given a valid verse', () => {
    expect(WordAlignmentHelpers.getTargetLanguageVerse(targetLanguageVerse)).toBe(expectedOutput);
  });
  it('should not parse the target language at all given an invalid verse', () => {
    expect(WordAlignmentHelpers.getTargetLanguageVerse(null)).toBe(undefined);
  });
});

describe('WordAlignmentHelpers.getVerseStringFromVerseObjects', () => {
  it('should properly get a verse string from verse objects', () => {
    const { alignment, alignedVerseString } = require('./fixtures/pivotAlignmentVerseObjects/matt1-1a.json');
    const alignments = alignment;
    expect(WordAlignmentHelpers.getCurrentGreekVerseFromAlignments({ alignments })).toBe(alignedVerseString);
  });
  it('should get a empty verse string from empty alignments', () => {
    const alignments = [];
    expect(WordAlignmentHelpers.getCurrentGreekVerseFromAlignments({ alignments })).toBe('');
  });
  it('should get undefined from no alignments object given', () => {
    expect(WordAlignmentHelpers.getCurrentGreekVerseFromAlignments({})).toBe(undefined);
  });
});

describe('WordAlignmentHelpers.getGreekVerse', () => {
  it('should properly get a greek verse string from verse objects', () => {
    const expectedGreekString = 'Τίτῳ γνησίῳ τέκνῳ κατὰ κοινὴν πίστιν χάρις καὶ εἰρήνη ἀπὸ Θεοῦ Πατρὸς καὶ Χριστοῦ Ἰησοῦ τοῦ Σωτῆρος ἡμῶν';
    const bookId = 'tit';
    const chapter = 1;
    let verse = 4;
    const verseObjects = require(`./fixtures/verseObjects/${bookId}${chapter}-${verse}.json`);
    expect(WordAlignmentHelpers.getGreekVerse(verseObjects)).toBe(expectedGreekString);
  });
});

describe('WordAlignmentHelpers.getVerseStringFromVerseObjects', () => {
  it('should correctly retrieve target language if verse string matches 100%', () => {
    const { verseString, alignment, wordBank } = require('./fixtures/pivotAlignmentVerseObjects/matt1-1a.json');
    const alignments = alignment;
    expect(WordAlignmentHelpers.getCurrentTargetLanguageVerseFromAlignments({ alignments, wordBank }, verseString)).toBe(verseString);
  });
  it('should not correctly retrieve target language if verse string does not match 100%', () => {
    const { alignment, wordBank } = require('./fixtures/pivotAlignmentVerseObjects/matt1-1a.json');
    const verseString = 'This is a changed verse';
    const alignments = alignment;
    expect(WordAlignmentHelpers.getCurrentTargetLanguageVerseFromAlignments({ alignments, wordBank }, verseString)).toBe(null);
  });
  it('should not correctly retrieve target language if verse string does not match 100%', () => {
    let { alignment, wordBank, verseString } = require('./fixtures/pivotAlignmentVerseObjects/matt1-1a.json');
    verseString = verseString.slice(0, verseString.length - 1);
    const alignments = alignment;
    expect(WordAlignmentHelpers.getCurrentTargetLanguageVerseFromAlignments({ alignments, wordBank }, verseString)).toBe(null);
  });
});

describe('WordAlignmentHelpers.getWordsFromVerseObjects', () => {
  it('should flatten out vereseObject children with single nested objects', () => {
    const { verseObjects } = require('./fixtures/pivotAlignmentVerseObjects/matt1-1b.json');
    expect(WordAlignmentHelpers.getWordsFromVerseObjects(verseObjects)).toEqual([{
      tag: 'w',
      type: 'word',
      text: 'son',
      occurrence: 1,
      occurrences: 2
    },
    {
      tag: 'w',
      type: 'word',
      text: 'of',
      occurrence: 1,
      occurrences: 2
    },
    {
      tag: 'w',
      type: 'word',
      text: 'David',
      occurrence: 1,
      occurrences: 1
    },
    { type: 'text', text: ',' },
    {
      tag: 'w',
      type: 'word',
      text: 'son',
      occurrence: 2,
      occurrences: 2
    },
    {
      tag: 'w',
      type: 'word',
      text: 'of',
      occurrence: 2,
      occurrences: 2
    },
    {
      tag: 'w',
      type: 'word',
      text: 'Abraham',
      occurrence: 1,
      occurrences: 1
    },
    { type: 'text', text: '.' }]);
  });

  it('should flatten out vereseObject children with double nested objects', () => {
    const { verseObjects } = require('./fixtures/pivotAlignmentVerseObjects/oneToMany.json');
    expect(WordAlignmentHelpers.getWordsFromVerseObjects(verseObjects)).toEqual([{
      tag: 'w',
      type: 'word',
      text: 'de',
      occurrence: 1,
      occurrences: 1
    },
    {
      tag: 'w',
      type: 'word',
      text: 'Jesucristo',
      occurrence: 1,
      occurrences: 1
    }]);
  });
});

describe('WordAlignmentHelpers.generateBlankAlignments', () => {
  it('should generate blank alignment from nested objects', () => {
    // given
    const testData = require('./fixtures/pivotAlignmentVerseObjects/tit1-1.nested_milestones.json');
    const nullAlignments = createEmptyAlignment(testData.alignedVerseString);

    //when
    const results = WordAlignmentHelpers.generateBlankAlignments(testData.alignedVerseString);

    //then
    expect(results).toEqual(nullAlignments);
  });

  it('should generate blank alignment from string', () => {
    // given
    const testData = require('./fixtures/pivotAlignmentVerseObjects/tit1-1.nested_milestones.json');
    const nullAlignments = createEmptyAlignment(testData.verseString);

    //when
    const results = WordAlignmentHelpers.generateBlankAlignments(testData.verseString);

    //then
    expect(results).toEqual(nullAlignments);
  });

  //
  // helpers
  //
  const createEmptyAlignment = function (verseObjects) {
    let wordList = VerseObjectHelpers.getWordList(verseObjects);
    wordList = populateOccurrencesInWordObjects(wordList);
    const nullAlignments = wordList.map(word => {
      return {
        topWords: [
          {
            word: word.text,
            strong: word.strong,
            lemma: word.lemma,
            morph: word.morph,
            occurrence: word.occurrence,
            occurrences: word.occurrences
          }
        ],
        bottomWords: []
      };
    });
    return nullAlignments;
  };
});

describe('WordAlignmentHelpers.generateWordBank', () => {
  it('should generate blank alignment from string', () => {
    // given
    const testData = require('./fixtures/pivotAlignmentVerseObjects/tit1-1.nested_milestones.json');
    const wordBank = createEmptyWordBank(testData.verseString);

    //when
    const results = WordAlignmentHelpers.generateWordBank(testData.verseString);

    //then
    expect(results).toEqual(wordBank);
  });

  it('should generate blank alignment from nested objects', () => {
    // given
    const testData = require('./fixtures/pivotAlignmentVerseObjects/tit1-1.nested_milestones.json');
    const wordBank = createEmptyWordBank(testData.alignedVerseString);

    //when
    const results = WordAlignmentHelpers.generateWordBank(testData.alignedVerseString);

    //then
    expect(results).toEqual(wordBank);
  });

  //
  // helpers
  //
  const createEmptyWordBank = function (verseObjects) {
    let wordList = VerseObjectHelpers.getWordList(verseObjects);
    wordList = populateOccurrencesInWordObjects(wordList);
    const wordBank = wordList.map(word => {
      return {
        word: word.text,
        occurrence: word.occurrence,
        occurrences: word.occurrences
      };
    });
    return wordBank;
  };
});


describe('WordAlignmentHelpers.checkProjectForAlignments', () => {
  const sourcePath = "__tests__/fixtures/project/wordAlignment";
  beforeEach(() => {
    // reset mock filesystem data
    fs.__resetMockFS();
    fs.__setMockFS({}); // initialize to empty
  });
  afterEach(() => {
    // reset mock filesystem data
    fs.__resetMockFS();
  });

  it('should return true for a project that has made alignments', () => {
    const sourceProject = 'normal_project';
    let copyFiles = [sourceProject];
    fs.__loadFilesIntoMockFs(copyFiles, sourcePath, sourcePath);
    const wordAlignmentDataPath = '__tests__/fixtures/project/wordAlignment/normal_project/.apps/translationCore/alignmentData/tit';
    const chapters = ['1.json', '2.json', '3.json'];
    let progress = WordAlignmentHelpers.checkProjectForAlignments(wordAlignmentDataPath, chapters);
    expect(progress).toBeTruthy();
  });

  it('should return false for a project that has blank alignments', () => {
    const sourceProject = 'empty_project';
    let copyFiles = [sourceProject];
    fs.__loadFilesIntoMockFs(copyFiles, sourcePath, sourcePath);
    const wordAlignmentDataPath = '__tests__/fixtures/project/wordAlignment/empty_project/.apps/translationCore/alignmentData/tit';
    const chapters = ['1.json'];
    let progress = WordAlignmentHelpers.checkProjectForAlignments(wordAlignmentDataPath, chapters);
    expect(progress).toBeFalsy();
  });

  it('should return false for a project that has not opened wA tool', () => {
    const wordAlignmentDataPath = 'wordaligment/data/that/doesnt/exist';
    const chapters = ['1.json'];
    let progress = WordAlignmentHelpers.checkProjectForAlignments(wordAlignmentDataPath, chapters);
    expect(progress).toBeFalsy();
  });
});
