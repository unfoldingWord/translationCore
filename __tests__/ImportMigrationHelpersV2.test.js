import path from 'path';
import * as fs from 'fs-extra';
/* eslint-env jest */
/* eslint-disable no-console */
'use strict';
import migrateToVersion2 from "../src/js/helpers/ProjectMigration/migrateToVersion2";
import * as MigrateToVersion2 from "../src/js/helpers/ProjectMigration/migrateToVersion2";
import * as Version from "../src/js/helpers/ProjectMigration/VersionUtils";
jest.mock('fs-extra');

const manifest = {
  "project": {"id": "mat", "name": ""},
  "type": {"id": "text", "name": "Text"},
  "generator": {"name": "ts-android", "build": 175},
  "package_version": 7,
  "target_language": {
    "name": "ગુજરાતી",
    "direction": "ltr",
    "anglicized_name": "Gujarati",
    "region": "Asia",
    "is_gateway_language": false,
    "id": "gu"
  },
  "format": "usfm",
  "resource": {"id": "reg"},
  "translators": ["qa99"],
  "parent_draft": {"resource_id": "ulb", "checking_level": "3", "version": "1"},
  "source_translations": [{
    "language_id": "gu",
    "resource_id": "ulb",
    "checking_level": "3",
    "date_modified": 20161008,
    "version": "1"
  }]
};
const PROJECT_PATH = '__tests__/fixtures/project/migration/v1_project';

describe('migrateToVersion2', () => {
  beforeEach(() => {
    // reset mock filesystem data
    fs.__resetMockFS();
    // Set up mocked out filePath and data in mock filesystem before each test
    fs.__setMockFS({
      [PROJECT_PATH]:[],
      [path.join(PROJECT_PATH, 'manifest.json')]: manifest
    });
  });
  afterEach(() => {
    // reset mock filesystem data
    fs.__resetMockFS();
  });

  it('with no tc_version expect to set', () => {
    migrateToVersion2(PROJECT_PATH);
    const version = Version.getVersionFromManifest(PROJECT_PATH);

    expect(MigrateToVersion2.MIGRATE_MANIFEST_VERSION).toBe(2); // this shouldn't change
    expect(version).toBe(MigrateToVersion2.MIGRATE_MANIFEST_VERSION);
  });

  it('with lower tc_version expect to update version', () => {
    Version.setVersionInManifest(PROJECT_PATH, MigrateToVersion2.MIGRATE_MANIFEST_VERSION - 1);
    migrateToVersion2(PROJECT_PATH);
    const version = Version.getVersionFromManifest(PROJECT_PATH);

    expect(version).toBe(MigrateToVersion2.MIGRATE_MANIFEST_VERSION);
  });

  it('with higher tc_version expect to leave alone', () => {
    const manifestVersion = MigrateToVersion2.MIGRATE_MANIFEST_VERSION + 1;
    Version.setVersionInManifest(PROJECT_PATH, manifestVersion);
    migrateToVersion2(PROJECT_PATH);
    const version = Version.getVersionFromManifest(PROJECT_PATH);

    expect(version).toBe(manifestVersion);
  });

  it('with lower tc_version expect to update strongs to strong in alignment data', () => {
    const testVerse = 10;
    const testAlignment = 4;
    const sourcePath = "__tests__/fixtures/project/3jn_alignment/";
    const copyFiles = ['alignmentData'];
    const PROJECT_ALIGNMENT_DATA_PATH = path.join(PROJECT_PATH, '.app', 'translationCore');
    fs.__loadFilesIntoMockFs(copyFiles, sourcePath, PROJECT_ALIGNMENT_DATA_PATH);
    const chapter1_alignment_path = path.join(PROJECT_ALIGNMENT_DATA_PATH, 'alignmentData', '3jn', '1.json');

    // make sure test data set up correctly
    let word = getFirstWordFromChapter(chapter1_alignment_path, testVerse, testAlignment);
    expect(word.strong).not.toBeDefined();
    expect(typeof word.strongs).toEqual("string");

    Version.setVersionInManifest(PROJECT_PATH, MigrateToVersion2.MIGRATE_MANIFEST_VERSION - 1);
    migrateToVersion2(PROJECT_PATH);
    const version = Version.getVersionFromManifest(PROJECT_PATH);

    // strongs should be updated
    word = getFirstWordFromChapter(chapter1_alignment_path, testVerse, testAlignment);
    expect(word.strongs).not.toBeDefined();
    expect(typeof word.strong).toEqual("string");

    expect(version).toBe(MigrateToVersion2.MIGRATE_MANIFEST_VERSION);
  });
});

//
// helpers
//

const getFirstWordFromChapter = function (alignment_file, verse, alignment) {
  const chapter = fs.readJsonSync(alignment_file);
  const vs10 = chapter[verse];
  const alignment4 = vs10.alignments[alignment];
  return alignment4.topWords[0];

};
