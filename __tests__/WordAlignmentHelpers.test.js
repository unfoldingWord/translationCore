/* eslint-env jest */
import React from 'react';
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

describe('WordAlignmentHelpers.getProjectAlignmentName', () => {
  it('should get the name of a titus project according to the standard', () => {
    const manifest = {
      project: {
        id: 'tit'
      }
    };
    const expectedFileName = '57-TIT';
    const projectName = WordAlignmentHelpers.getProjectAlignmentName(manifest);
    expect(projectName).toBe(expectedFileName);
  });
  it('shouldn\'t get the name of a titus project if the manifest is missing', () => {
    const manifest = {
      project: {}
    };
    const projectName = WordAlignmentHelpers.getProjectAlignmentName(manifest);
    expect(projectName).toBe(undefined);
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
    const mockAlignmentFixture = fs.__actual.readJSONSync(path.join('__tests__','fixtures','pivotAlignmentVerseObjects','tit1-1.json'));
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

    const usfm = await WordAlignmentHelpers.convertAlignmentDataToUSFM(wordAlignmentDataPath, targetLanguageDataPath, chapterFiles);
    const foundMatch = usfm.includes('\\k-e\\*,\\k-s | x-strongs=\"G25960\" x-lemma=\"κατά\" x-morph=\"Gr,P,,,,,A,,,\" x-occurrence=\"1\" x-occurrences=\"1\" x-content=\"κατὰ\"');
    expect(foundMatch).toBeTruthy();
  });
});
