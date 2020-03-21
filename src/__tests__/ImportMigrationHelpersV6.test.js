/* eslint-env jest */
/* eslint-disable no-console */
import path from 'path';
import fs from 'fs-extra';
import migrateToVersion6,{ MIGRATE_MANIFEST_VERSION, findResourceIdAndNickname } from '../js/helpers/ProjectMigration/migrateToVersion6';
import * as Version from '../js/helpers/ProjectMigration/VersionUtils';
jest.mock('fs-extra');

const base_manifest = {
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

describe('migrateToVersion6', () => {
  let save_console = null;

  beforeAll(() => {
    save_console = global.console;
  });
  beforeEach(() => {
    const manifest = JSON.parse(JSON.stringify(base_manifest)); // clone so we can modify
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
  afterAll(() => {
    if (save_console) {
      global.console = save_console; // restore unmocked
    }
  });

  it('with no tc_version expect to set', () => {
    global.console = { error: jest.fn(), log: jest.fn() };
    // given

    // when
    migrateToVersion6(PROJECT_PATH);

    // then
    const version = Version.getVersionFromManifest(PROJECT_PATH);
    expect(MIGRATE_MANIFEST_VERSION).toBe(6); // this shouldn't change
    expect(version).toBe(MIGRATE_MANIFEST_VERSION);
    expect(console.error).toHaveBeenCalled();
  });

  it('with lower tc_version expect to update version', () => {
    global.console = { error: jest.fn(), log: jest.fn() };
    // given
    Version.setVersionInManifest(PROJECT_PATH, MIGRATE_MANIFEST_VERSION - 1);

    // when
    migrateToVersion6(PROJECT_PATH);

    // then
    const version = Version.getVersionFromManifest(PROJECT_PATH);
    expect(version).toBe(MIGRATE_MANIFEST_VERSION);
    expect(console.error).toHaveBeenCalled();
  });

  it('with same tc_version expect to leave alone', () => {
    // given
    const manifestVersion = MIGRATE_MANIFEST_VERSION;
    Version.setVersionInManifest(PROJECT_PATH, manifestVersion);

    // when
    migrateToVersion6(PROJECT_PATH);

    // then
    const version = Version.getVersionFromManifest(PROJECT_PATH);
    expect(version).toBe(manifestVersion);
  });

  it('should find resourceId and nickname', () => {
    // given
    let manifest = getManifest(PROJECT_PATH);

    manifest.resource = {
      id: 'ult',
      name: 'Unlocked Literal Translation',
    };
    setManifest(PROJECT_PATH, manifest);
    const expectedResourceId = 'ult';
    const expectedNickName = 'Unlocked Literal Translation';

    // when
    migrateToVersion6(PROJECT_PATH);

    // then
    manifest = getManifest(PROJECT_PATH);
    expect(manifest.resource.id).toEqual(expectedResourceId);
    expect(manifest.resource.name).toEqual(expectedNickName);
  });
});

describe('ManifestHelpers.findResourceIdAndNickname', () => {
  const base_manifest = {
    project: {
      id: 'tit',
      name: 'Titus',
    },
  };

  test('if not present should not find resource id or nickname', () => {
    // given
    const manifest = JSON.parse(JSON.stringify(base_manifest)); // clone before modifying
    const expectedResourceId = undefined;
    const expectedNickName = undefined;

    // when
    findResourceIdAndNickname(manifest);

    // then
    expect(manifest.resource && manifest.resource.id).toEqual(expectedResourceId);
    expect(manifest.resource && manifest.resource.name).toEqual(expectedNickName);
  });

  test('if manifest empty should not find resource id or nickname or crash', () => {
    // given
    const manifest = {};
    const expectedResourceId = undefined;
    const expectedNickName = undefined;

    // when
    findResourceIdAndNickname(manifest);

    // then
    expect(manifest.resource && manifest.resource.id).toEqual(expectedResourceId);
    expect(manifest.resource && manifest.resource.name).toEqual(expectedNickName);
  });

  test('if present in dublin_core, should find resource id or nickname', () => {
    // given
    const manifest = JSON.parse(JSON.stringify(base_manifest)); // clone before modifying

    manifest.dublin_core = {
      identifier: 'ult',
      title: 'Unlocked Literal Translation',
    };

    const expectedResourceId = 'ult';
    const expectedNickName = 'Unlocked Literal Translation';

    // when
    findResourceIdAndNickname(manifest);

    // then
    expect(manifest.resource.id).toEqual(expectedResourceId);
    expect(manifest.resource.name).toEqual(expectedNickName);
  });

  test('if present in dublin_core, should not overwrite pre-existing resource id or nickname', () => {
    // given
    const manifest = JSON.parse(JSON.stringify(base_manifest)); // clone before modifying

    manifest.dublin_core = {
      identifier: 'ult',
      title: 'Unlocked Literal Translation',
    };
    manifest.resource = {
      name: 'Unlocked Greek New Testament',
      id: 'ugnt',
    };

    const expectedResourceId = 'ugnt';
    const expectedNickName = 'Unlocked Greek New Testament';

    // when
    findResourceIdAndNickname(manifest);

    // then
    expect(manifest.resource.id).toEqual(expectedResourceId);
    expect(manifest.resource.name).toEqual(expectedNickName);
  });

  test('if present in dublin_core and no project filed, should find resource id or nickname and not crash', () => {
    // given
    const manifest = {
      dublin_core: {
        identifier: 'ult',
        title: 'Unlocked Literal Translation',
      },
    };
    const expectedResourceId = 'ult';
    const expectedNickName = 'Unlocked Literal Translation';

    // when
    findResourceIdAndNickname(manifest);

    // then
    expect(manifest.resource.id).toEqual(expectedResourceId);
    expect(manifest.resource.name).toEqual(expectedNickName);
  });

  test('if present in resource, should find resource id or nickname', () => {
    // given
    const manifest = JSON.parse(JSON.stringify(base_manifest)); // clone before modifying

    manifest.resource = {
      id: 'ult',
      name: 'Unlocked Literal Translation',
    };

    const expectedResourceId = 'ult';
    const expectedNickName = 'Unlocked Literal Translation';

    // when
    findResourceIdAndNickname(manifest);

    // then
    expect(manifest.resource.id).toEqual(expectedResourceId);
    expect(manifest.resource.name).toEqual(expectedNickName);
  });
});

//
// helpers
//

const getManifest = function (PROJECT_PATH) {
  const manifest_path = path.join(PROJECT_PATH, 'manifest.json');
  return fs.readJsonSync(manifest_path);
};

const setManifest = function (PROJECT_PATH, manifest) {
  const manifest_path = path.join(PROJECT_PATH, 'manifest.json');
  return fs.outputJsonSync(manifest_path, manifest);
};

