/* eslint-env jest */
import fs from 'fs-extra';
import path from 'path-extra';
//helpers
import * as WordAlignmentHelpers from '../src/js/helpers/WordAlignmentHelpers';
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
  const expectedWordAlignmentPath = path.join(projectSaveLocation, '.apps', 'translationCore', 'alignmentData', manifest.project.id);
  const expectedTargetLanguagePath = path.join(projectSaveLocation, manifest.project.id);

  beforeEach(() => {
    // reset mock filesystem data
    fs.__resetMockFS();
    // Set up mock filesystem before each test
    fs.__setMockFS({
      [path.join(projectSaveLocation, 'manifest.json')]: manifest,
      [path.join(projectSaveLocation, manifest.project.id)]: {},
      [expectedWordAlignmentPath]: expectedChapters
    });
  });

  afterEach(() => {
    fs.__resetMockFS();
  });

  it('should retrieve the paths to an alignment project if it exists', () => {
    const { chapters, wordAlignmentDataPath, projectTargetLanguagePath } = WordAlignmentHelpers.getAlignmentPathsFromProject(projectSaveLocation);
    expect(chapters).toBe(expectedChapters);
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