import path from 'path';
import pathex from 'path-extra';
import * as fs from 'fs-extra';
/* eslint-env jest */
/* eslint-disable no-console */
'use strict';
import migrateAppsToDotApps from '../src/js/helpers/ProjectMigration/migrateAppsToDotApps';
import migrateToVersion1 from "../src/js/helpers/ProjectMigration/migrateToVersion1";
import * as MigrateToVersion1 from "../src/js/helpers/ProjectMigration/migrateToVersion1";
import * as Version from "../src/js/helpers/ProjectMigration/VersionUtils";
import * as ProjectMigrationActions from "../src/js/actions/Import/ProjectMigrationActions";
import * as manifestUtils from "../src/js/helpers/ProjectMigration/manifestUtils";
const LEGACY_MIGRATED = '__tests__/fixtures/project/migration/legacy_migrated';
const LEGACY = '__tests__/fixtures/project/migration/legacy';
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


describe('migrateAppsToDotApps', () => {
  beforeEach(() => {
    // reset mock filesystem data
    fs.__resetMockFS();
    // Set up mocked out filePath and data in mock filesystem before each test
    fs.__setMockFS({
      [LEGACY_MIGRATED]:['apps', '.apps'],
      [LEGACY]:['apps'],
      [path.join(LEGACY_MIGRATED, 'apps')]: {},
      [path.join(LEGACY_MIGRATED, '.apps')]: {},
      [path.join(LEGACY, 'apps')]: {}
    });
  });
  afterEach(() => {
    // reset mock filesystem data
    fs.__resetMockFS();
  });

  it('remove the regular apps folder if both legacy and new folder exist', () => {
    migrateAppsToDotApps(LEGACY_MIGRATED);
    expect(fs.existsSync(path.join(LEGACY_MIGRATED, 'apps'))).toBeFalsy();
    expect(fs.existsSync(path.join(LEGACY_MIGRATED, '.apps'))).toBeTruthy();
  });

  it('rename the regular apps folder if legacy the folder exist', () => {
    migrateAppsToDotApps(LEGACY);
    expect(fs.existsSync(path.join(LEGACY, '.apps'))).toBeTruthy();
    expect(fs.existsSync(path.join(LEGACY, 'apps'))).toBeFalsy();
  });
});

describe('migrateToVersion1', () => {
  beforeEach(() => {
    // reset mock filesystem data
    fs.__resetMockFS();
    // Set up mocked out filePath and data in mock filesystem before each test
    fs.__setMockFS({
      [LEGACY]:[],
      [path.join(LEGACY, 'manifest.json')]: manifest
    });
  });
  afterEach(() => {
    // reset mock filesystem data
    fs.__resetMockFS();
  });

  it('with no tc_version expect to set', () => {
    migrateToVersion1(LEGACY);
    const version = Version.getVersionFromManifest(LEGACY);

    expect(MigrateToVersion1.MIGRATE_MANIFEST_VERSION).toBe(1); // this shouldn't change
    expect(version).toBe(MigrateToVersion1.MIGRATE_MANIFEST_VERSION);
  });

  it('with lower tc_version expect to update', () => {
    Version.setVersionInManifest(LEGACY, MigrateToVersion1.MIGRATE_MANIFEST_VERSION - 1);
    migrateToVersion1(LEGACY);
    const version = Version.getVersionFromManifest(LEGACY);

    expect(version).toBe(MigrateToVersion1.MIGRATE_MANIFEST_VERSION);
  });

  it('with higher tc_version expect to leave alone', () => {
    const manifestVersion = MigrateToVersion1.MIGRATE_MANIFEST_VERSION + 1;
    Version.setVersionInManifest(LEGACY, manifestVersion);
    migrateToVersion1(LEGACY);
    const version = Version.getVersionFromManifest(LEGACY);

    expect(version).toBe(manifestVersion);
  });
});

describe('ProjectMigration/migrate', () => {
  beforeEach(() => {
    // reset mock filesystem data
    fs.__resetMockFS();
    // Set up mocked out filePath and data in mock filesystem before each test
    fs.__setMockFS({
      [LEGACY]:['apps'],
      [path.join(LEGACY, '.apps')]: {},
      [path.join(LEGACY, 'manifest.json')]: manifest
    });
  });
  afterEach(() => {
    // reset mock filesystem data
    fs.__resetMockFS();
  });

  it('expect migration to update version', () => {
    ProjectMigrationActions.migrate(LEGACY);
    const manifestVersion = Version.getVersionFromManifest(LEGACY);
    const version = Version.getCurrentManifestVersion();

    expect(manifestVersion).toBeGreaterThan(0); // this should always be a number greater than 0
    expect(version).toEqual(manifestVersion);
    const manifest = manifestUtils.getProjectManifest(LEGACY, undefined);
    expect(manifest.tcInitialized).toBeTruthy();
  });
});
