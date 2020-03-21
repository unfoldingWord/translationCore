/* eslint-env jest */
/* eslint-disable no-console */
import path from 'path';
import fs from 'fs-extra';
import migrateToVersion5, { MIGRATE_MANIFEST_VERSION } from '../js/helpers/ProjectMigration/migrateToVersion5';
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

describe('migrateToVersion5', () => {
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
    migrateToVersion5(PROJECT_PATH);
    const version = Version.getVersionFromManifest(PROJECT_PATH);

    expect(MIGRATE_MANIFEST_VERSION).toBe(5); // this shouldn't change
    expect(version).toBe(MIGRATE_MANIFEST_VERSION);
  });

  it('with lower tc_version expect to update version', () => {
    Version.setVersionInManifest(PROJECT_PATH, MIGRATE_MANIFEST_VERSION - 1);
    migrateToVersion5(PROJECT_PATH);
    const version = Version.getVersionFromManifest(PROJECT_PATH);

    expect(version).toBe(MIGRATE_MANIFEST_VERSION);
  });

  it('with higher tc_version expect to leave alone', () => {
    const manifestVersion = MIGRATE_MANIFEST_VERSION + 1;
    Version.setVersionInManifest(PROJECT_PATH, manifestVersion);
    migrateToVersion5(PROJECT_PATH);
    const version = Version.getVersionFromManifest(PROJECT_PATH);

    expect(version).toBe(manifestVersion);
  });

  it('with lower tc_version expect to update alignment data and fix zero occurrences', () => {
    // given
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
    const alignedTitus = path.join('src', '__tests__','fixtures','migration', 'fix_occurrences', 'tit1-1.json');
    const expectedAlignedData = fs.__actual.readJsonSync(alignedTitus);

    const modifiedData = JSON.parse(JSON.stringify(expectedAlignedData)); // clone before modifying
    clearOccurrenceData(modifiedData);
    fs.outputFileSync(chapter1_alignment_path, modifiedData);

    Version.setVersionInManifest(projectPath, 4);

    // when
    migrateToVersion5(projectPath);

    // then
    const version = Version.getVersionFromManifest(projectPath);
    expect(version).toBe(MIGRATE_MANIFEST_VERSION);
    const fixedAlignedData = fs.readJsonSync(chapter1_alignment_path);

    expect(fixedAlignedData).toEqual(expectedAlignedData);
  });

  it('with lower tc_version expect to update alignment data and not fix non-zero occurrences', () => {
    // given
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
    const alignedTitus = path.join('src', '__tests__','fixtures','migration', 'fix_occurrences', 'tit1-1.json');

    const modifiedData = fs.__actual.readJsonSync(alignedTitus);
    incrementOccurrenceData(modifiedData);
    fs.outputFileSync(chapter1_alignment_path, modifiedData);
    const expectedAlignedData = modifiedData;

    Version.setVersionInManifest(projectPath, 4);

    // when
    migrateToVersion5(projectPath);

    // then
    const version = Version.getVersionFromManifest(projectPath);
    expect(version).toBe(MIGRATE_MANIFEST_VERSION);
    const fixedAlignedData = fs.readJsonSync(chapter1_alignment_path);

    expect(fixedAlignedData).toEqual(expectedAlignedData);
  });
});

//
// helpers
//

function clearOccurrenceData(modifiedData) {
  const verse = modifiedData[1];

  for (let alignment of verse.alignments) {
    for (let word of alignment.topWords) {
      word.occurrence = 0;
      word.occurrences = 0;
    }
  }
}

function incrementOccurrenceData(modifiedData) {
  const verse = modifiedData[1];

  for (let alignment of verse.alignments) {
    for (let word of alignment.topWords) {
      word.occurrence++;
      word.occurrences++;
    }
  }
}
