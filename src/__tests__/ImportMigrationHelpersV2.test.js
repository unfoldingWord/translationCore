/* eslint-env jest */
/* eslint-disable no-console */
import fs from 'fs-extra';
import path from 'path-extra';
import migrateToVersion2, { MIGRATE_MANIFEST_VERSION, updateAlignmentsForFile } from '../js/helpers/ProjectMigration/migrateToVersion2';
import * as Version from '../js/helpers/ProjectMigration/VersionUtils';
jest.mock('fs-extra');

const manifest = {
  'project': { 'id': 'mat', 'name': '' },
  'type': { 'id': 'text', 'name': 'Text' },
  'generator': { 'name': 'ts-android', 'build': 175 },
  'package_version': 7,
  'target_language': {
    'name': 'ગુજરાતી',
    'direction': 'ltr',
    'anglicized_name': 'Gujarati',
    'region': 'Asia',
    'is_gateway_language': false,
    'id': 'gu',
  },
  'format': 'usfm',
  'resource': { 'id': 'reg' },
  'translators': ['qa99'],
  'parent_draft': {
    'resource_id': 'ult', 'checking_level': '3', 'version': '1',
  },
  'source_translations': [{
    'language_id': 'gu',
    'resource_id': 'ult',
    'checking_level': '3',
    'date_modified': 20161008,
    'version': '1',
  }],
};
const PROJECT_PATH = path.join(__dirname, 'fixtures/project/migration/v1_project');

describe('migrateToVersion2', () => {
  beforeEach(() => {
    // reset mock filesystem data
    fs.__resetMockFS();
    // Set up mocked out filePath and data in mock filesystem before each test
    fs.__setMockFS({
      [PROJECT_PATH]:[],
      [path.join(PROJECT_PATH, 'manifest.json')]: manifest,
    });
  });
  afterEach(() => {
    // reset mock filesystem data
    fs.__resetMockFS();
  });

  it('with no tc_version expect to set', () => {
    migrateToVersion2(PROJECT_PATH);
    const version = Version.getVersionFromManifest(PROJECT_PATH);

    expect(MIGRATE_MANIFEST_VERSION).toBe(2); // this shouldn't change
    expect(version).toBe(MIGRATE_MANIFEST_VERSION);
  });

  it('with lower tc_version expect to update version', () => {
    Version.setVersionInManifest(PROJECT_PATH, MIGRATE_MANIFEST_VERSION - 1);
    migrateToVersion2(PROJECT_PATH);
    const version = Version.getVersionFromManifest(PROJECT_PATH);

    expect(version).toBe(MIGRATE_MANIFEST_VERSION);
  });

  it('with higher tc_version expect to leave alone', () => {
    const manifestVersion = MIGRATE_MANIFEST_VERSION + 1;
    Version.setVersionInManifest(PROJECT_PATH, manifestVersion);
    migrateToVersion2(PROJECT_PATH);
    const version = Version.getVersionFromManifest(PROJECT_PATH);

    expect(version).toBe(manifestVersion);
  });

  it('with lower tc_version expect to update alignment data', () => {
    // given
    const testVerse = 10;
    const testAlignment = 4;
    const sourcePath = path.join(__dirname, 'fixtures/project');
    const book_id = 'tit';
    const project_id = 'en_' + book_id;
    const copyFiles = [project_id];
    fs.__loadFilesIntoMockFs(copyFiles, sourcePath, PROJECT_PATH);
    const projectPath = path.join(PROJECT_PATH, project_id);
    const projectAlignmentDataPath = path.join(projectPath, '.apps', 'translationCore');
    fs.outputFileSync(path.join(projectAlignmentDataPath, 'alignmentData','ignoreMe'), ''); // this file should be ignored
    fs.ensureDirSync(path.join(projectAlignmentDataPath, 'alignmentData','.DS_Store')); // this folder should be ignored
    const chapter1_alignment_path = path.join(projectAlignmentDataPath, 'alignmentData', book_id, '1.json');

    // make sure test data set up correctly
    let word = getFirstWordFromChapter(chapter1_alignment_path, null, testVerse, testAlignment);
    expect(word.strong).not.toBeDefined();
    expect(typeof word.strongs).toEqual('string');

    Version.setVersionInManifest(projectPath, MIGRATE_MANIFEST_VERSION - 1);

    // when
    migrateToVersion2(projectPath);

    // then
    const version = Version.getVersionFromManifest(projectPath);
    expect(version).toBe(MIGRATE_MANIFEST_VERSION);
    const chapterData = getChapterData(chapter1_alignment_path);

    // strongs should be updated
    word = getFirstWordFromChapter(null, chapterData, testVerse, testAlignment);
    expect(word.strongs).not.toBeDefined();
    expect(typeof word.strong).toEqual('string');

    // occurrences should be updated
    word = getWordFromWordBankOrAlignments(chapterData, 1, 'a');
    expect(word.occurrence).toEqual(1);
    expect(word.occurrences).toEqual(1);

    word = getWordFromWordBankOrAlignments(chapterData, 1, 'an');
    expect(word.occurrence).toEqual(1);
    expect(word.occurrences).toEqual(1);

    word = getWordFromWordBankOrAlignments(chapterData, 1, 'the');
    expect(word.occurrences).toEqual(3);
  });

  it('updateAlignmentsForFile() expect to update alignment data', () => {
    // given
    const resource = path.join('src', '__tests__','fixtures','migration', 'fix_occurrences', 'tit1-1.json');
    const titusData = fs.__actual.readJsonSync(resource);
    const testVerse = 1;
    const testAlignment = 3;
    const fileName = '1.json';
    const projectPath = path.join(PROJECT_PATH, fileName);
    fs.outputJsonSync(projectPath, titusData);

    // when
    updateAlignmentsForFile(projectPath);

    // then
    const chapterData = getChapterData(projectPath);

    // strongs should be updated
    let word = getFirstWordFromChapter(null, chapterData, testVerse, testAlignment);
    expect(word.strongs).not.toBeDefined();
    expect(typeof word.strong).toEqual('string');

    // occurrences should be updated
    word = getWordFromWordBankOrAlignments(chapterData, 1, 'a');
    expect(word.occurrence).toEqual(1);
    expect(word.occurrences).toEqual(1);

    word = getWordFromWordBankOrAlignments(chapterData, 1, 'an');
    expect(word.occurrence).toEqual(1);
    expect(word.occurrences).toEqual(1);

    word = getWordFromWordBankOrAlignments(chapterData, 1, 'the', 3);
    expect(word.occurrence).toEqual(3);
    expect(word.occurrences).toEqual(3);

    word = getWordFromWordBankOrAlignments(chapterData, 1, 'of', 4);
    expect(word.occurrence).toEqual(4);
    expect(word.occurrences).toEqual(4);
  });
});

//
// helpers
//

let getChapterData = function (alignment_file) {
  return fs.readJsonSync(alignment_file);
};

const getFirstWordFromChapter = function (alignment_file, chapterData, verse, alignment) {
  if (!chapterData) {
    chapterData = getChapterData(alignment_file);
  }

  const verseData = chapterData[verse];
  const alignmentData = verseData.alignments[alignment];
  return alignmentData.topWords[0];
};

const getWordFromWordBankOrAlignments = function (chapterData, verse, word, occurrence = 1) {
  const verseData = chapterData[verse];
  const wordBank = verseData.wordBank;
  let count = 0;
  const wordMatch = wordBank.find(wordItem => {
    if (wordItem.word === word) {
      if (++count === occurrence) {
        return true;
      }
    }
    return false;
  },
  );

  if (!wordMatch) {
    for (let alignment of verseData.alignments) {
      for (let bottomWord of alignment.bottomWords) {
        if (bottomWord.word === word) {
          if (++count === occurrence) {
            return bottomWord;
          }
        }
      }
    }
  }
  return wordMatch;
};
