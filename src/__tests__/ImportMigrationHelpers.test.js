/* eslint-env jest */
/* eslint-disable no-console */
import path from 'path';
import fs from 'fs-extra';
import migrateAppsToDotApps from '../js/helpers/ProjectMigration/migrateAppsToDotApps';
import migrateToVersion1, { MIGRATE_MANIFEST_VERSION } from '../js/helpers/ProjectMigration/migrateToVersion1';
import * as Version from '../js/helpers/ProjectMigration/VersionUtils';
import migrateProject from '../js/helpers/ProjectMigration';
import * as manifestUtils from '../js/helpers/ProjectMigration/manifestUtils';

const LEGACY_MIGRATED = path.join(__dirname, 'fixtures/project/migration/legacy_migrated');
const LEGACY = path.join(__dirname, 'fixtures/project/migration/legacy');
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
const manifest_v3 = {
  'finished_frames': [
    '05-01',
    '05-05',
    '05-09',
    '05-11',
    '05-16',
    '05-19',
    '05-25',
    '05-22',
    '05-03',
    '05-13',
  ],
  'generator': {
    'build': 108,
    'name': 'ts-android',
  },
  'package_version': 3,
  'project_id': 'gal',
  'source_translations': {
    'gal-en-udt': {
      'checking_level': 3,
      'date_modified': 20151120,
      'version': '2.0.0-beta15',
    },
    'gal-en-ult': {
      'checking_level': 3,
      'date_modified': 20151120,
      'version': '2.0.0-beta15',
    },
  },
  'target_language': {
    'direction': 'ltr',
    'id': 'hsl',
    'name': 'Hausa Sign Language',
  },
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
      [path.join(LEGACY, 'apps')]: {},
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
      [path.join(LEGACY, 'manifest.json')]: manifest,
    });
  });
  afterEach(() => {
    // reset mock filesystem data
    fs.__resetMockFS();
  });

  it('with no tc_version expect to set', () => {
    migrateToVersion1(LEGACY);
    const version = Version.getVersionFromManifest(LEGACY);

    expect(MIGRATE_MANIFEST_VERSION).toBe(1); // this shouldn't change
    expect(version).toBe(MIGRATE_MANIFEST_VERSION);
  });

  it('with lower tc_version expect to update', () => {
    Version.setVersionInManifest(LEGACY, MIGRATE_MANIFEST_VERSION - 1);
    migrateToVersion1(LEGACY);
    const version = Version.getVersionFromManifest(LEGACY);

    expect(version).toBe(MIGRATE_MANIFEST_VERSION);
  });

  it('with higher tc_version expect to leave alone', () => {
    const manifestVersion = MIGRATE_MANIFEST_VERSION + 1;
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
    fs.ensureDirSync(path.join(LEGACY, 'apps'));
    fs.ensureDirSync(path.join(LEGACY, '.apps'));
    fs.outputJSONSync(path.join(LEGACY, 'manifest.json'), manifest);
  });
  afterEach(() => {
    // reset mock filesystem data
    fs.__resetMockFS();
  });

  it('expect migration to update to current version', async () => {
    await migrateProject(LEGACY);
    const manifestVersion = Version.getVersionFromManifest(LEGACY);
    const version = Version.getCurrentManifestVersion();

    expect(manifestVersion).toBeGreaterThan(0); // this should always be a number greater than 0
    expect(version).toEqual(manifestVersion);
    const manifest = manifestUtils.getProjectManifest(LEGACY, undefined);
    expect(manifest.tcInitialized).toBeTruthy();
  });

  it('expect migration of ts version 3 manifest to update version', async () => {
    fs.outputJsonSync(path.join(LEGACY, 'manifest.json'), manifest_v3);
    await migrateProject(LEGACY);
    const manifestVersion = Version.getVersionFromManifest(LEGACY);
    const version = Version.getCurrentManifestVersion();

    expect(manifestVersion).toBeGreaterThan(0); // this should always be a number greater than 0
    expect(version).toEqual(manifestVersion);
    const manifest = manifestUtils.getProjectManifest(LEGACY, undefined);
    expect(manifest.tcInitialized).toBeTruthy();
  });
});
