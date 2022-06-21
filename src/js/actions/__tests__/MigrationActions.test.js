/* eslint-env jest */
import path from 'path';
import fs from 'fs-extra';
import isEqual from 'deep-equal';
// helpers
import * as MigrationActions from '../MigrationActions';
import { getFoldersInResourceFolder, removeOutDatedResources } from '../../helpers/ResourcesHelpers';
import {
  APP_VERSION, STATIC_RESOURCES_PATH, TC_VERSION, USER_RESOURCES_PATH, USFMJS_VERSION
} from '../../common/constants';

// mocks
let mockOtherTnsOlversions = [];

jest.mock('tc-source-content-updater', () => ({
  ...require.requireActual('tc-source-content-updater'),
  getOtherTnsOLVersions: () => mockOtherTnsOlversions,
}));

// constants
const STATIC_RESOURCE_MODIFIED_TIME = '2019-06-19T20:09:10+00:00';

describe('migrate tCore resources', () => {
  beforeEach(() => {
    fs.__resetMockFS();
    // simulate static resources path
    fs.__loadFilesIntoMockFs(['resources'], path.join('src', '__tests__', 'fixtures'), path.join(STATIC_RESOURCES_PATH, '..'));
    fs.moveSync(path.join(STATIC_RESOURCES_PATH, '../resources'), STATIC_RESOURCES_PATH);
    fs.removeSync(path.join(STATIC_RESOURCES_PATH, 'en/bibles/ult/v11_Door43-Catalog')); // remove old version
    fs.__loadFilesIntoMockFs(['source-content-updater-manifest.json'], STATIC_RESOURCES_PATH, STATIC_RESOURCES_PATH);
    setModifiedTimeForResources(STATIC_RESOURCES_PATH, STATIC_RESOURCE_MODIFIED_TIME);
  });

  describe('Test without grc resource migration', () => {
    it('test with no user resources', () => {
      // given
      const expectedHelpsVers = [];
      const expectedBibleVers = [];
      const migrateResourcesFolder = MigrationActions.migrateResourcesFolder(false);

      // when
      migrateResourcesFolder();

      // then
      const folders = getResourceFolders();
      expect(folders).toMatchSnapshot();
      verifyResources(expectedHelpsVers, expectedBibleVers);
    });

    it('test with t4t - should not delete', () => {
      // given
      const expectedHelpsVers = [];
      const expectedBibleVers = ['v12.1_Door43-Catalog'];
      fs.copySync(path.join(STATIC_RESOURCES_PATH, 'en/bibles/ult'), path.join(USER_RESOURCES_PATH, 'en/bibles/t4t'));
      const migrateResourcesFolder = MigrationActions.migrateResourcesFolder(false);

      // when
      migrateResourcesFolder();

      // then
      const folders = getResourceFolders();
      expect(folders).toMatchSnapshot();
      verifyResources(expectedHelpsVers, expectedBibleVers);
    });

    it('test with old en_ult - should delete old version', () => {
      // given
      const expectedHelpsVers = [];
      const expectedBibleVers = [];
      fs.copySync(STATIC_RESOURCES_PATH, USER_RESOURCES_PATH);
      const manifestPath = path.join(USER_RESOURCES_PATH, 'source-content-updater-manifest.json');
      const manifest = fs.readJsonSync(manifestPath);
      manifest[TC_VERSION] = APP_VERSION; // add app version to resource
      fs.outputJsonSync(manifestPath, manifest);
      const ultPath = path.join(USER_RESOURCES_PATH, 'en/bibles/ult');
      const currentVersion = getFoldersInResourceFolder(ultPath)[0];
      const oldResourcePath = path.join(ultPath, 'v0.0.1_Door43-Catalog');
      fs.moveSync(path.join(ultPath, currentVersion), oldResourcePath);
      setModifiedTimeForResource(oldResourcePath, '1900');
      const migrateResourcesFolder = MigrationActions.migrateResourcesFolder(false);

      // when
      migrateResourcesFolder();

      // then
      const folders = getResourceFolders();
      expect(folders).toMatchSnapshot();
      verifyResources(expectedHelpsVers, expectedBibleVers);
    });

    it('test with t4t, old tHelps resources and up to date resources - should not delete anything', () => {
      // given
      const expectedHelpsVers = ['v8.1_Door43-Catalog'];
      const expectedBibleVers = ['v12.1_Door43-Catalog'];
      fs.copySync(STATIC_RESOURCES_PATH, USER_RESOURCES_PATH);
      const manifestPath = path.join(USER_RESOURCES_PATH, 'source-content-updater-manifest.json');
      const manifest = fs.readJsonSync(manifestPath);
      manifest[TC_VERSION] = APP_VERSION; // add app version to resource
      fs.outputJsonSync(manifestPath, manifest);
      fs.copySync(path.join(STATIC_RESOURCES_PATH, 'en/bibles/ult'), path.join(USER_RESOURCES_PATH, 'en/bibles/t4t'));
      fs.copySync(path.join(STATIC_RESOURCES_PATH, 'hi/translationHelps/translationWords'), path.join(USER_RESOURCES_PATH, 'x-test/translationHelps/translationWords'));
      const migrateResourcesFolder = MigrationActions.migrateResourcesFolder(false);

      // when
      migrateResourcesFolder();

      // then
      const folders = getResourceFolders();
      expect(folders).toMatchSnapshot();
      verifyResources(expectedHelpsVers, expectedBibleVers);
    });

    it('test with t4t, old tHelps resources, up to date resources and different app version - should remove old helps and keep old bibles', () => {
      // given
      const expectedHelpsVers = [];
      const expectedBibleVers = ['v12.1_Door43-Catalog'];
      fs.copySync(STATIC_RESOURCES_PATH, USER_RESOURCES_PATH);
      const manifestPath = path.join(USER_RESOURCES_PATH, 'source-content-updater-manifest.json');
      const manifest = fs.readJsonSync(manifestPath);
      manifest[TC_VERSION] = 'x.x.x'; // add different version to resource
      fs.outputJsonSync(manifestPath, manifest);
      fs.copySync(path.join(STATIC_RESOURCES_PATH, 'en/bibles/ult'), path.join(USER_RESOURCES_PATH, 'en/bibles/t4t'));
      fs.copySync(path.join(STATIC_RESOURCES_PATH, 'hi/translationHelps/translationWords'), path.join(USER_RESOURCES_PATH, 'x-test/translationHelps/translationWords'));
      const migrateResourcesFolder = MigrationActions.migrateResourcesFolder(false);

      // when
      migrateResourcesFolder();

      // then
      const folders = getResourceFolders();
      expect(folders).toMatchSnapshot();
      verifyResources(expectedHelpsVers, expectedBibleVers);
    });

    it('test with t4t, old tHelps resources and not up to date resources - should remove old helps and keep old bibles', () => {
      // given
      const expectedHelpsVers = [];
      const expectedBibleVers = ['v12.1_Door43-Catalog'];
      fs.copySync(STATIC_RESOURCES_PATH, USER_RESOURCES_PATH);
      const manifestPath = path.join(USER_RESOURCES_PATH, 'source-content-updater-manifest.json');
      const manifest = fs.readJsonSync(manifestPath);
      manifest[TC_VERSION] = APP_VERSION; // add app version to resource
      manifest.modified = '2014' + manifest.modified.substr(4);
      fs.outputJsonSync(manifestPath, manifest);
      fs.copySync(path.join(STATIC_RESOURCES_PATH, 'en/bibles/ult'), path.join(USER_RESOURCES_PATH, 'en/bibles/t4t'));
      fs.copySync(path.join(STATIC_RESOURCES_PATH, 'hi/translationHelps/translationWords'), path.join(USER_RESOURCES_PATH, 'x-test/translationHelps/translationWords'));
      const migrateResourcesFolder = MigrationActions.migrateResourcesFolder(false);

      // when
      migrateResourcesFolder();

      // then
      const folders = getResourceFolders();
      expect(folders).toMatchSnapshot();
      verifyResources(expectedHelpsVers, expectedBibleVers);
    });

    it('test with t4t, old tHelps resources and up to date resources - should not delete anything', () => {
      // given
      const expectedHelpsVers = ['v8.1_Door43-Catalog'];
      const expectedBibleVers = ['v12.1_Door43-Catalog'];
      fs.copySync(STATIC_RESOURCES_PATH, USER_RESOURCES_PATH);
      const manifestPath = path.join(USER_RESOURCES_PATH, 'source-content-updater-manifest.json');
      const manifest = fs.readJsonSync(manifestPath);
      manifest[TC_VERSION] = APP_VERSION; // add app version to resource
      manifest.modified = '9999' + manifest.modified.substr(4);
      fs.outputJsonSync(manifestPath, manifest);
      fs.copySync(path.join(STATIC_RESOURCES_PATH, 'en/bibles/ult'), path.join(USER_RESOURCES_PATH, 'en/bibles/t4t'));
      fs.copySync(path.join(STATIC_RESOURCES_PATH, 'hi/translationHelps/translationWords'), path.join(USER_RESOURCES_PATH, 'x-test/translationHelps/translationWords'));
      const migrateResourcesFolder = MigrationActions.migrateResourcesFolder(false);

      // when
      migrateResourcesFolder();

      // then
      const folders = getResourceFolders();
      expect(folders).toMatchSnapshot();
      verifyResources(expectedHelpsVers, expectedBibleVers);
    });

    it('test with old tHelps resources - should delete', () => {
      // given
      const expectedHelpsVers = false;
      const expectedBibleVers = false;
      fs.copySync(path.join(STATIC_RESOURCES_PATH, 'hi/translationHelps/translationWords'), path.join(USER_RESOURCES_PATH, 'x-test/translationHelps/translationWords'));
      const migrateResourcesFolder = MigrationActions.migrateResourcesFolder(false);

      // when
      migrateResourcesFolder();

      // then
      const folders = getResourceFolders();
      expect(folders).toMatchSnapshot();
      verifyResources(expectedHelpsVers, expectedBibleVers);
    });

    it('test with current el-x-koine tHelps resources - should not delete', () => {
      // given
      const expectedHelpsVers = false;
      const expectedBibleVers = false;
      fs.copySync(path.join(STATIC_RESOURCES_PATH, 'el-x-koine/translationHelps/translationWords'), path.join(USER_RESOURCES_PATH, 'el-x-koine/translationHelps/translationWords'));
      const manifestPath = path.join(STATIC_RESOURCES_PATH, 'source-content-updater-manifest.json');
      const manifest = fs.readJsonSync(manifestPath);
      manifest[TC_VERSION] = APP_VERSION; // add app version to resource
      fs.outputJsonSync(path.join(USER_RESOURCES_PATH, 'source-content-updater-manifest.json'), manifest);
      const migrateResourcesFolder = MigrationActions.migrateResourcesFolder(false);

      // when
      migrateResourcesFolder();

      // then
      const folders = getResourceFolders();
      expect(folders).toMatchSnapshot();
      verifyResources(expectedHelpsVers, expectedBibleVers);
    });

    it('test with old el-x-koine tHelps resources (no manifest.json) - should update', () => {
      // given
      const expectedHelpsVers = false;
      const expectedBibleVers = false;
      fs.removeSync(path.join(STATIC_RESOURCES_PATH, 'el-x-koine/translationHelps/translationWords/v8/manifest.json'));
      fs.copySync(path.join(STATIC_RESOURCES_PATH, 'el-x-koine/translationHelps/translationWords/v8'), path.join(USER_RESOURCES_PATH, 'el-x-koine/translationHelps/translationWords/v7'));
      const manifestPath = path.join(STATIC_RESOURCES_PATH, 'source-content-updater-manifest.json');
      const manifest = fs.readJsonSync(manifestPath);
      manifest[TC_VERSION] = APP_VERSION; // add app version to resource
      fs.outputJsonSync(path.join(USER_RESOURCES_PATH, 'source-content-updater-manifest.json'), manifest);
      const migrateResourcesFolder = MigrationActions.migrateResourcesFolder(false);

      // when
      migrateResourcesFolder();

      // then
      const folders = getResourceFolders();
      expect(folders).toMatchSnapshot();
      verifyResources(expectedHelpsVers, expectedBibleVers);
    });

    it('test with empty uhb folder - should upgrade', () => {
      // given
      const uhbFolder = path.join(USER_RESOURCES_PATH, 'hbo/bibles/uhb');
      fs.ensureDirSync(uhbFolder);
      const migrateResourcesFolder = MigrationActions.migrateResourcesFolder(false);

      // when
      migrateResourcesFolder();

      // then
      const folders = getResourceFolders();
      expect(folders).toMatchSnapshot();
      const uhbVersionExists = fs.existsSync(path.join(uhbFolder, 'v0_Door43-Catalog'));
      expect(uhbVersionExists).toBeTruthy();
    });

    it('test with empty hbo bibles folder - should upgrade', () => {
      // given
      const uhbFolder = path.join(USER_RESOURCES_PATH, 'hbo/bibles');
      fs.ensureDirSync(uhbFolder);
      const migrateResourcesFolder = MigrationActions.migrateResourcesFolder(false);

      // when
      migrateResourcesFolder();

      // then
      const folders = getResourceFolders();
      expect(folders).toMatchSnapshot();
      const uhbVersionExists = fs.existsSync(path.join(uhbFolder, 'uhb/v0_Door43-Catalog'));
      expect(uhbVersionExists).toBeTruthy();
    });

    it('test with empty hbo language folder - should upgrade', () => {
      // given
      const uhbFolder = path.join(USER_RESOURCES_PATH, 'hbo');
      fs.ensureDirSync(uhbFolder);
      const migrateResourcesFolder = MigrationActions.migrateResourcesFolder(false);

      // when
      migrateResourcesFolder();

      // then
      const folders = getResourceFolders();
      expect(folders).toMatchSnapshot();
      const uhbVersionExists = fs.existsSync(path.join(uhbFolder, 'bibles/uhb/v0_Door43-Catalog'));
      expect(uhbVersionExists).toBeTruthy();
    });
  });

  describe('Test grc resource migration', () => {
    afterEach(() => {
      mockOtherTnsOlversions = [];
    });

    it('test with xx in grc/bible - should migrate to el-x-koine', () => {
      // given
      const expectedHelpsVers = false;
      const expectedBibleVers = ['v0.2_Door43-Catalog'];
      const bibleId = 'xx';
      fs.copySync(path.join(STATIC_RESOURCES_PATH, 'el-x-koine/bibles/ugnt'), path.join(USER_RESOURCES_PATH, 'grc/bibles', bibleId));
      const migrateResourcesFolder = MigrationActions.migrateResourcesFolder(false);

      // when
      migrateResourcesFolder();

      // then
      const folders = getResourceFolders();
      expect(folders).toMatchSnapshot();
      verifyResources(expectedHelpsVers, expectedBibleVers, 'el-x-koine/bibles/' + bibleId);
      expect(fs.existsSync(path.join(USER_RESOURCES_PATH, 'grc'))).toBeFalsy(); // should remove folder
    });

    it('test with older version of xx in grc/bible - should not move', () => {
      // given
      const expectedHelpsVers = false;
      const expectedBibleVers = ['v0.2_Door43-Catalog'];
      const bibleId = 'xx';
      fs.copySync(path.join(STATIC_RESOURCES_PATH, 'el-x-koine/bibles/ugnt'), path.join(USER_RESOURCES_PATH, 'el-x-koine/bibles', bibleId));
      fs.copySync(path.join(USER_RESOURCES_PATH, 'el-x-koine/bibles', bibleId, 'v0.2_Door43-Catalog'), path.join(USER_RESOURCES_PATH, 'grc/bibles', bibleId, 'v0.1_Door43-Catalog'));
      const migrateResourcesFolder = MigrationActions.migrateResourcesFolder(false);

      // when
      migrateResourcesFolder();

      // then
      const folders = getResourceFolders();
      expect(folders).toMatchSnapshot();
      verifyResources(expectedHelpsVers, expectedBibleVers, 'el-x-koine/bibles/' + bibleId);
      expect(fs.existsSync(path.join(USER_RESOURCES_PATH, 'grc'))).toBeFalsy(); // should remove folder
    });

    it('test with older version of ugnt in grc/bible - should not be removed', () => {
      // given
      mockOtherTnsOlversions = ['v0.1_Door43-Catalog', 'v0.2_Door43-Catalog'];
      const expectedHelpsVers = false;
      const expectedBibleVers = ['v0.1_Door43-Catalog', 'v0.2_Door43-Catalog'];
      const bibleId = 'ugnt';
      fs.copySync(path.join(STATIC_RESOURCES_PATH, 'el-x-koine/bibles', bibleId, 'v0.2_Door43-Catalog'), path.join(USER_RESOURCES_PATH, 'grc/bibles', bibleId, 'v0.1_Door43-Catalog'));
      const migrateResourcesFolder = MigrationActions.migrateResourcesFolder(false);

      // when
      migrateResourcesFolder();

      // then
      const folders = getResourceFolders();
      expect(folders).toMatchSnapshot();
      verifyResources(expectedHelpsVers, expectedBibleVers, 'el-x-koine/bibles/' + bibleId);
      expect(fs.existsSync(path.join(USER_RESOURCES_PATH, 'grc'))).toBeFalsy(); // should remove folder
    });

    it('test with newer version of ugnt in el-x-koine/bible - newer version should not be deleted', () => {
      // given
      mockOtherTnsOlversions = ['v0.1_Door43-Catalog', 'v0.2_Door43-Catalog'];
      const expectedHelpsVers = false;
      const expectedBibleVers = ['v0.2_Door43-Catalog', 'v0.3_Door43-Catalog'];
      const bibleId = 'ugnt';
      fs.copySync(path.join(STATIC_RESOURCES_PATH, 'el-x-koine/bibles', bibleId, 'v0.2_Door43-Catalog'), path.join(USER_RESOURCES_PATH, 'el-x-koine/bibles', bibleId, 'v0.3_Door43-Catalog'));
      const migrateResourcesFolder = MigrationActions.migrateResourcesFolder(false);

      // when
      migrateResourcesFolder();

      // then
      const folders = getResourceFolders();
      expect(folders).toMatchSnapshot();
      verifyResources(expectedHelpsVers, expectedBibleVers, 'el-x-koine/bibles/' + bibleId);
    });

    it('test with two version of ugnt in el-x-koine/bible - all versions copied', () => {
      // given
      mockOtherTnsOlversions = [];
      const expectedHelpsVers = false;
      const expectedBibleVers = ['v0.2_Door43-Catalog', 'v0.3_Door43-Catalog'];
      const bibleId = 'ugnt';
      fs.copySync(path.join(STATIC_RESOURCES_PATH, 'el-x-koine/bibles', bibleId, 'v0.2_Door43-Catalog'), path.join(STATIC_RESOURCES_PATH, 'el-x-koine/bibles', bibleId, 'v0.3_Door43-Catalog'));
      const migrateResourcesFolder = MigrationActions.migrateResourcesFolder(false);

      // when
      migrateResourcesFolder();

      // then
      const folders = getResourceFolders();
      expect(folders).toMatchSnapshot();
      verifyResources(expectedHelpsVers, expectedBibleVers, 'el-x-koine/bibles/' + bibleId);
    });
  });

  it('test with two version of ugnt in el-x-koine/bible and a recent dependency - all versions copied', () => {
    // given
    mockOtherTnsOlversions = ['v0.3_Door43-Catalog'];
    const expectedHelpsVers = false;
    const expectedBibleVers = ['v0.2_Door43-Catalog', 'v0.3_Door43-Catalog'];
    const bibleId = 'ugnt';
    fs.copySync(path.join(STATIC_RESOURCES_PATH, 'el-x-koine/bibles', bibleId, 'v0.2_Door43-Catalog'), path.join(STATIC_RESOURCES_PATH, 'el-x-koine/bibles', bibleId, 'v0.3_Door43-Catalog'));
    const migrateResourcesFolder = MigrationActions.migrateResourcesFolder(false);

    // when
    migrateResourcesFolder();

    // then
    const folders = getResourceFolders();
    expect(folders).toMatchSnapshot();
    verifyResources(expectedHelpsVers, expectedBibleVers, 'el-x-koine/bibles/' + bibleId);
  });

  describe('migrate tCore resources', () => {
    it('should delete bibles with no usfm-js in manifest', () => {
      // given
      mockOtherTnsOlversions = ['v0.1_Door43-Catalog', 'v0.2_Door43-Catalog'];
      const bibleId = 'ugnt';
      const destinationPath = path.join(USER_RESOURCES_PATH, 'el-x-koine/bibles', bibleId, 'v0.3_Door43-Catalog');
      fs.copySync(path.join(STATIC_RESOURCES_PATH, 'el-x-koine/bibles', bibleId, 'v0.2_Door43-Catalog'), destinationPath);

      // when
      removeOutDatedResources();

      // then
      const folders = getResourceFolders();
      expect(folders.length).toEqual(0);
    });

    it('should delete bibles with older usfm-js version in manifest', () => {
      // given
      mockOtherTnsOlversions = ['v0.1_Door43-Catalog', 'v0.2_Door43-Catalog'];
      const bibleId = 'ugnt';
      const destinationPath = path.join(USER_RESOURCES_PATH, 'el-x-koine/bibles', bibleId, 'v0.3_Door43-Catalog');
      fs.copySync(path.join(STATIC_RESOURCES_PATH, 'el-x-koine/bibles', bibleId, 'v0.2_Door43-Catalog'), destinationPath);
      const destinationManifestPath = path.join(destinationPath, 'manifest.json');
      const manifest = fs.readJsonSync(destinationManifestPath);
      manifest['usfm-js'] = '1.0.0';
      fs.outputJsonSync(destinationManifestPath, manifest);

      // when
      removeOutDatedResources();

      // then
      const folders = getResourceFolders();
      expect(folders.length).toEqual(0);
    });

    it('should not delete old bibles with current version usfm-js in manifest', () => {
      // given
      mockOtherTnsOlversions = ['v0.1_Door43-Catalog', 'v0.2_Door43-Catalog'];
      const bibleId = 'ugnt';
      const destinationPath = path.join(USER_RESOURCES_PATH, 'el-x-koine/bibles', bibleId, 'v0.3_Door43-Catalog');
      fs.copySync(path.join(STATIC_RESOURCES_PATH, 'el-x-koine/bibles', bibleId, 'v0.2_Door43-Catalog'), destinationPath);
      const destinationManifestPath = path.join(destinationPath, 'manifest.json');
      const manifest = fs.readJsonSync(destinationManifestPath);
      manifest['usfm-js'] = USFMJS_VERSION;
      fs.outputJsonSync(destinationManifestPath, manifest);

      // when
      removeOutDatedResources();

      // then
      const folders = getResourceFolders();
      expect(folders.length).toEqual(1);
    });

    it('should delete bibles with newer usfm-js version in manifest', () => {
      // given
      mockOtherTnsOlversions = ['v0.1_Door43-Catalog', 'v0.2_Door43-Catalog'];
      const bibleId = 'ugnt';
      const destinationPath = path.join(USER_RESOURCES_PATH, 'el-x-koine/bibles', bibleId, 'v0.3_Door43-Catalog');
      fs.copySync(path.join(STATIC_RESOURCES_PATH, 'el-x-koine/bibles', bibleId, 'v0.2_Door43-Catalog'), destinationPath);
      const destinationManifestPath = path.join(destinationPath, 'manifest.json');
      const manifest = fs.readJsonSync(destinationManifestPath);
      const versionParts = USFMJS_VERSION.split('.');
      versionParts[2] = '1' + versionParts[2];
      manifest['usfm-js'] = versionParts.join('.');
      fs.outputJsonSync(destinationManifestPath, manifest);

      // when
      removeOutDatedResources();

      // then
      const folders = getResourceFolders();
      expect(folders.length).toEqual(0);
    });
  });
});

//
// Helpers
//

function toLinuxPath(filePath) {
  const newPath = filePath.split(path.sep).join(path.posix.sep);
  return newPath;
}

/**
 * check for presence of resource
 * @param {String} resource - subpath for resource
 * @param {Array} expectedVers - expected versions
 */
function verifyResourceExpected(resource, expectedVers) {
  const resourceFolder = path.join(USER_RESOURCES_PATH, resource);
  const versions = getFoldersInResourceFolder(resourceFolder).sort();
  expectedVers = Array.isArray(expectedVers) ? expectedVers : [];

  if (!isEqual(versions, expectedVers.sort())) {
    const expectedArray = expectedVers.sort().toString();
    const foundArray = versions.toString();
    console.log(`Expected '${resource}' versions: [${expectedArray}], but found: [${foundArray}]`);
    expect(versions).toEqual(expectedVers.sort());
  }
}

function verifyResources(expectedHelpsVers, expectedBibleVers, bibleId = 'en/bibles/t4t') {
  verifyResourceExpected('x-test/translationHelps/translationWords', expectedHelpsVers);
  verifyResourceExpected(bibleId, expectedBibleVers);
}

function modifyManifest(resourcePath, key, newValue) {
  const tnManifestPath = path.join(resourcePath, 'manifest.json');
  let manifest = {};

  if (fs.existsSync(tnManifestPath)) {
    manifest = fs.readJsonSync(tnManifestPath);
  }
  manifest[key] = newValue;
  fs.outputJsonSync(tnManifestPath, manifest);
}

function setModifiedTimeForResource(resourcePath, newModifiedTime) {
  modifyManifest(resourcePath, 'catalog_modified_time', newModifiedTime);
}

function getResourceFolders() {
  const paths = [];
  const languages = getFoldersInResourceFolder(USER_RESOURCES_PATH);

  for (let language of languages) {
    const resourceTypesPath = path.join(USER_RESOURCES_PATH, language);
    const resourceTypes = getFoldersInResourceFolder(resourceTypesPath);

    for (let resourceTYpe of resourceTypes) {
      const resourcesPath = path.join(resourceTypesPath, resourceTYpe);
      const resources = getFoldersInResourceFolder(resourcesPath);

      for (let resource of resources) {
        const versionsPath = path.join(resourcesPath, resource);
        const versions = getFoldersInResourceFolder(versionsPath);

        for (let version of versions) {
          const versionPath = toLinuxPath(path.join(versionsPath, version));
          paths.push(versionPath);
        }
      }
    }
  }
  return paths;
}

function setModifiedTimeForResources(resourcePath, modifiedTime) {
  const languages = getFoldersInResourceFolder(resourcePath);

  for (let language of languages) {
    const resourceTypesPath = path.join(resourcePath, language);
    const resourceTypes = getFoldersInResourceFolder(resourceTypesPath);

    for (let resourceTYpe of resourceTypes) {
      const resourcesPath = path.join(resourceTypesPath, resourceTYpe);
      const resources = getFoldersInResourceFolder(resourcesPath);

      for (let resource of resources) {
        const versionsPath = path.join(resourcesPath, resource);
        const versions = getFoldersInResourceFolder(versionsPath);

        for (let version of versions) {
          const versionPath = toLinuxPath(path.join(versionsPath, version));
          setModifiedTimeForResource(versionPath, modifiedTime);
        }
      }
    }
  }
}
