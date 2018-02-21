/* eslint-env jest */
import fs from 'fs-extra';
import path from 'path-extra';
//helpers
import * as WordAlignmentHelpers from '../src/js/helpers/WordAlignmentHelpers';
//consts
import { STATIC_RESOURCES_PATH } from '../src/js/helpers/ResourcesHelpers';
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
  it('shouldn\'t convert alignments from a project that doesn\'t exist', () => {
    expect.assertions(1);
    return expect(WordAlignmentHelpers.convertAlignmentDataToUSFM('sdkjl'))
      .rejects.toBeTruthy();
  });
  it('should convert alignments from a project that does exist', () => {
    fs.__loadDirIntoMockFs('__tests__/fixtures/pivotAlignmentVerseObjects', 'my/mock/alignments');
    const mockAlignmentFixture = fs.readJSONSync(path.join('my', 'mock', 'alignments', 'tit1-1.json'));
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

    // reset mock filesystem data
    fs.__resetMockFS();
    // Set up mock filesystem before each test
    fs.outputFileSync(path.join(wordAlignmentDataPath, chapterFiles[0]), wordAlignmentData);
    fs.outputFileSync(path.join(targetLanguageDataPath, chapterFiles[0]), targetLangauageData);

    WordAlignmentHelpers.convertAlignmentDataToUSFM(wordAlignmentDataPath, targetLanguageDataPath, chapterFiles)
    .then((usfm)=>{
      expect(usfm.includes('\\zaln-e\\*,\\zaln-s | x-strongs=\"G25960\" x-lemma=\"κατά\" x-morph=\"Gr,P,,,,,A,,,\" x-occurrence=\"1\" x-occurrences=\"1\" x-content=\"κατὰ\"'))
      .toBeTruthy();
    });
  });
});

describe('WordAlignmentHelpers.checkVerseForChanges', () => {
  const projectSaveLocation = 'project/targetLanguages/alignments';
  const changedProjectSaveLocation = 'changed/project/targetLanguages/alignments';
  const bookId = 'matt';
  const chapter = 1;
  let verse = 1;
  const greekVerseObjects = {
    [verse]: require(`./fixtures/verseObjects/${bookId}${chapter}-${verse}.json`)
  };
  const { alignment, wordBank, verseString } = require(`./fixtures/pivotAlignmentVerseObjects/${bookId}${chapter}-${verse}.json`);
  const verseAlignments = { alignments: alignment, wordBank };
  beforeEach(() => {
    // reset mock filesystem data
    fs.__resetMockFS();
    // Set up mock filesystem before each test
    const changedTargetLanguageChapterPath = path.join(changedProjectSaveLocation, bookId, `${chapter}.json`);
    const targetLanguageChapterPath = path.join(projectSaveLocation, bookId, `${chapter}.json`);
    const greekChapterPath = path.join(STATIC_RESOURCES_PATH, 'grc', 'bibles', 'ugnt', 'v0', bookId, `${chapter}.json`);
    fs.__setMockFS({
      [greekChapterPath]: greekVerseObjects,
      [targetLanguageChapterPath]: { [verse]: verseString },
      [changedTargetLanguageChapterPath]: { [verse]: 'Some one changes this verse.'}
    });
  });
  it('should not find a change in the saved alignments from the data on file', () => {
    expect(WordAlignmentHelpers.checkVerseForChanges(verseAlignments, bookId, chapter, verse, projectSaveLocation)).toBe(false);
  });
  it('should not find a change in the saved alignments from the data on file', () => {
    expect(WordAlignmentHelpers.checkVerseForChanges(verseAlignments, bookId, chapter, verse, changedProjectSaveLocation)).toBe(true);
  });
});



describe('WordAlignmentHelpers.getStaticGreekVerse', () => {
  let bookId = 'tit';
  let chapter = 1;
  const expectedGreek = { greekAlignments: true };
  beforeEach(() => {
    // reset mock filesystem data
    fs.__resetMockFS();
    // Set up mock filesystem before each test
    const greekChapterPath = path.join(STATIC_RESOURCES_PATH, 'grc', 'bibles', 'ugnt', 'v0', bookId, `${chapter}.json`);
    fs.__setMockFS({
      [greekChapterPath]: expectedGreek
    });
  });
  it('should get the correct greek chapter with a valid chapter specified', () => {
    expect(WordAlignmentHelpers.getStaticGreekVerse(bookId, chapter)).toEqual(expectedGreek);
  });

  it('should not get the correct greek chapter with an invalid chapter specified', () => {
    expect(WordAlignmentHelpers.getStaticGreekVerse(bookId, 6)).toEqual(undefined);
  });
});


describe('WordAlignmentHelpers.getVerseStringFromWordObjects', () => {
  it('should properly get a verse string from verse objects', () => {
    const { verseObjects, verseString } = require('./fixtures/pivotAlignmentVerseObjects/matt1-1a.json');
    const filter = ['word'];
    expect(WordAlignmentHelpers.getVerseStringFromWordObjects({ verseObjects }, filter)).toBe(verseString);
  });

  it('should properly get a verse string from verse objects', () => {
    const { verseObjects, verseString } = require('./fixtures/pivotAlignmentVerseObjects/oneToMany.json');
    const filter = ['word'];
    expect(WordAlignmentHelpers.getVerseStringFromWordObjects({ verseObjects }, filter)).toBe(verseString);
  });
});

describe('WordAlignmentHelpers.getTargetLanguageVerse', () => {
  const targetLanguageVerseInput = "ते बरदाश्त केरने बैली, पवित्र, घरेरो कारोबार केरने बैल्ली, भलाई केरने बैली ते अपने अपने मुन्शाँ केरे आधीन रहने बैली भोंन, ताकि परमेशरेरे वचनेरी निन्दा न भोए|";
  const targetLanguageVerseOutput = "ते बरदाश्त केरने बैली पवित्र घरेरो कारोबार केरने बैल्ली भलाई केरने बैली ते अपने अपने मुन्शाँ केरे आधीन रहने बैली भोंन ताकि परमेशरेरे वचनेरी निन्दा न भोए";
  const bookId = 'tit';
  const chapter = 1;
  const verse = 1;
  const projectSaveLocation = 'valid/targetLanguage/verse';
  beforeEach(() => {
    // reset mock filesystem data
    fs.__resetMockFS();
    // Set up mock filesystem before each test
    const targetLanguageChapterPath = path.join(projectSaveLocation, bookId, `${chapter}.json`);
    fs.__setMockFS({
      [targetLanguageChapterPath]: { [verse]: targetLanguageVerseInput } 
    });
  });
  it('should parse the target language correctly given a valid path', () => {
    expect(WordAlignmentHelpers.getTargetLanguageVerse(bookId, chapter, verse, projectSaveLocation)).toBe(targetLanguageVerseOutput);
  });
  it('should not parse the target language at all given an invalid path', () => {
    expect(WordAlignmentHelpers.getTargetLanguageVerse(bookId, 6, verse, projectSaveLocation)).toBe(undefined);
  });
});

describe('WordAlignmentHelpers.getVerseStringFromWordObjects', () => {
  it('should properly get a verse string from verse objects', () => {
    const { alignment, alignedVerseString } = require('./fixtures/pivotAlignmentVerseObjects/matt1-1a.json');
    const alignments = alignment;
    expect(WordAlignmentHelpers.getCurrentGreekVerseFromAlignments({alignments})).toBe(alignedVerseString);
  });
  it('should get a empty verse string from empty alignments', () => {
    const alignments = [];
    expect(WordAlignmentHelpers.getCurrentGreekVerseFromAlignments({alignments})).toBe('');
  });
  it('should get undefined from no alignments object given', () => {
    expect(WordAlignmentHelpers.getCurrentGreekVerseFromAlignments({})).toBe(undefined);
  });
});



describe('WordAlignmentHelpers.getVerseStringFromWordObjects', () => {
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