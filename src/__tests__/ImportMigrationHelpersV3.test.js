/* eslint-env jest */
/* eslint-disable no-console */
import path from 'path';
import fs from 'fs-extra';
import migrateToVersion3, { MIGRATE_MANIFEST_VERSION } from '../js/helpers/ProjectMigration/migrateToVersion3';
import * as Version from '../js/helpers/ProjectMigration/VersionUtils';
import { TRANSLATION_WORDS } from '../js/common/constants';
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

describe('migrateToVersion3', () => {
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
    migrateToVersion3(PROJECT_PATH);
    const version = Version.getVersionFromManifest(PROJECT_PATH);

    expect(MIGRATE_MANIFEST_VERSION).toBe(3); // this shouldn't change
    expect(version).toBe(MIGRATE_MANIFEST_VERSION);
  });

  it('with lower tc_version expect to update version', () => {
    Version.setVersionInManifest(PROJECT_PATH, MIGRATE_MANIFEST_VERSION - 1);
    migrateToVersion3(PROJECT_PATH);
    const version = Version.getVersionFromManifest(PROJECT_PATH);

    expect(version).toBe(MIGRATE_MANIFEST_VERSION);
  });

  it('with higher tc_version expect to leave alone', () => {
    const manifestVersion = MIGRATE_MANIFEST_VERSION + 1;
    Version.setVersionInManifest(PROJECT_PATH, manifestVersion);
    migrateToVersion3(PROJECT_PATH);
    const version = Version.getVersionFromManifest(PROJECT_PATH);

    expect(version).toBe(manifestVersion);
  });

  it('with lower tc_version expect to update alignment data', () => {
    // given
    const match = 'ἐgκρατῆ';
    const replace = 'ἐνκρατῆ';
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
    const disciplineWords = path.join(projectAlignmentDataPath, 'index', TRANSLATION_WORDS, book_id, 'discipline.json');
    const believeWords = path.join(projectAlignmentDataPath, 'index', TRANSLATION_WORDS, book_id, 'believe.json');

    // make sure test data set up correctly
    expect(isStringInData(chapter1_alignment_path, match)).toBeTruthy();
    expect(isStringInData(chapter1_alignment_path, replace)).not.toBeTruthy();
    expect(isStringInData(disciplineWords, match)).toBeTruthy();
    expect(isStringInData(disciplineWords, replace)).not.toBeTruthy();
    expect(isStringInData(believeWords, match)).not.toBeTruthy();

    Version.setVersionInManifest(projectPath, MIGRATE_MANIFEST_VERSION - 1);

    // when
    migrateToVersion3(projectPath);

    // then
    const version = Version.getVersionFromManifest(projectPath);
    expect(version).toBe(MIGRATE_MANIFEST_VERSION);

    expect(isStringInData(chapter1_alignment_path, match)).not.toBeTruthy();
    expect(isStringInData(chapter1_alignment_path, replace)).toBeTruthy();
    expect(isStringInData(disciplineWords, match)).not.toBeTruthy();
    expect(isStringInData(disciplineWords, replace)).toBeTruthy();
    expect(isStringInData(believeWords, match)).not.toBeTruthy();
  });
});

//
// helpers
//

let getChapterData = function (alignment_file) {
  return fs.readJsonSync(alignment_file);
};

const isStringInData = function (filePath, match) {
  const chapterData = getChapterData(filePath);
  const json = JSON.stringify(chapterData);
  const index = json.indexOf(match);
  return index >= 0;
};
