import path from 'path';
import fs from "fs-extra";
// helpers
import * as MigrationActions from "../MigrationActions";
// constants
import {APP_VERSION, STATIC_RESOURCES_PATH, TC_VERSION, USER_RESOURCES_PATH} from '../../common/constants';
import {getFoldersInResourceFolder} from "../../helpers/ResourcesHelpers";

// constants
const mockConsole = console;
jest.mock('../../helpers/ResourcesHelpers', () => ({
  ...require.requireActual('../../helpers/ResourcesHelpers'),
  extractZippedResourceContent: (resourceDestinationPath, isBible) => {
    mockConsole.log(`mock extractZippedResourceContent: resourceDestinationPath=${resourceDestinationPath} isBible=${isBible}`);
  }
}));

describe("migrate tCore resources", () => {
  beforeEach(() => {
    fs.__resetMockFS();
    // simulate static resources path
    fs.__loadFilesIntoMockFs(['resources'], path.join('__tests__', 'fixtures'), path.join(STATIC_RESOURCES_PATH, ".."));
    fs.moveSync(path.join(STATIC_RESOURCES_PATH, "../resources"), STATIC_RESOURCES_PATH);
    fs.removeSync(path.join(STATIC_RESOURCES_PATH, "en/bibles/ult/v11")); // remove old version
    fs.__loadFilesIntoMockFs(['source-content-updater-manifest.json'], STATIC_RESOURCES_PATH, STATIC_RESOURCES_PATH);
  });

  describe('Test without grc resource migration', () => {

    it("test with no user resources", () => {
      // given
      const oldHelpsExpected = false;
      const oldBibleExpected = false;
      const migrateResourcesFolder = MigrationActions.migrateResourcesFolder();

      // when
      migrateResourcesFolder();
      // then
      const folders = getResourceFolders();
      expect(folders).toMatchSnapshot();
      verifyResources(oldHelpsExpected, oldBibleExpected);
    });

    it("test with t4t - should not delete", () => {
      // given
      const oldHelpsExpected = false;
      const oldBibleExpected = true;
      fs.copySync(path.join(STATIC_RESOURCES_PATH, "en/bibles/ult"), path.join(USER_RESOURCES_PATH, "en/bibles/t4t"));
      const migrateResourcesFolder = MigrationActions.migrateResourcesFolder();

      // when
      migrateResourcesFolder();

      // then
      const folders = getResourceFolders();
      expect(folders).toMatchSnapshot();
      verifyResources(oldHelpsExpected, oldBibleExpected);
    });

    it("test with old en_ult - should delete old version", () => {
      // given
      const oldHelpsExpected = false;
      const oldBibleExpected = false;
      fs.copySync(STATIC_RESOURCES_PATH, USER_RESOURCES_PATH);
      const manifestPath = path.join(USER_RESOURCES_PATH, 'source-content-updater-manifest.json');
      const manifest = fs.readJsonSync(manifestPath);
      manifest[TC_VERSION] = APP_VERSION; // add app version to resource
      fs.outputJsonSync(manifestPath, manifest);
      const ultPath = path.join(STATIC_RESOURCES_PATH, "en/bibles/ult");
      const currentVersion = getFoldersInResourceFolder(ultPath)[0];
      fs.moveSync(path.join(ultPath, currentVersion), path.join(ultPath, "v0.0.1"));
      const migrateResourcesFolder = MigrationActions.migrateResourcesFolder();

      // when
      migrateResourcesFolder();

      // then
      const folders = getResourceFolders();
      expect(folders).toMatchSnapshot();
      verifyResources(oldHelpsExpected, oldBibleExpected);
    });

    it("test with t4t, old tHelps resources and up to date resources - should not delete anything", () => {
      // given
      const oldHelpsExpected = true;
      const oldBibleExpected = true;
      fs.copySync(STATIC_RESOURCES_PATH, USER_RESOURCES_PATH);
      const manifestPath = path.join(USER_RESOURCES_PATH, 'source-content-updater-manifest.json');
      const manifest = fs.readJsonSync(manifestPath);
      manifest[TC_VERSION] = APP_VERSION; // add app version to resource
      fs.outputJsonSync(manifestPath, manifest);
      fs.copySync(path.join(STATIC_RESOURCES_PATH, "en/bibles/ult"), path.join(USER_RESOURCES_PATH, "en/bibles/t4t"));
      fs.copySync(path.join(STATIC_RESOURCES_PATH, "hi/translationHelps/translationWords"), path.join(USER_RESOURCES_PATH, "x-test/translationHelps/translationWords"));
      const migrateResourcesFolder = MigrationActions.migrateResourcesFolder();

      // when
      migrateResourcesFolder();

      // then
      const folders = getResourceFolders();
      expect(folders).toMatchSnapshot();
      verifyResources(oldHelpsExpected, oldBibleExpected);
    });

    it("test with t4t, old tHelps resources, up to date resources and different app version - should remove old helps and keep old bibles", () => {
      // given
      const oldHelpsExpected = false;
      const oldBibleExpected = true;
      fs.copySync(STATIC_RESOURCES_PATH, USER_RESOURCES_PATH);
      const manifestPath = path.join(USER_RESOURCES_PATH, 'source-content-updater-manifest.json');
      const manifest = fs.readJsonSync(manifestPath);
      manifest[TC_VERSION] = "x.x.x"; // add different version to resource
      fs.outputJsonSync(manifestPath, manifest);
      fs.copySync(path.join(STATIC_RESOURCES_PATH, "en/bibles/ult"), path.join(USER_RESOURCES_PATH, "en/bibles/t4t"));
      fs.copySync(path.join(STATIC_RESOURCES_PATH, "hi/translationHelps/translationWords"), path.join(USER_RESOURCES_PATH, "x-test/translationHelps/translationWords"));
      const migrateResourcesFolder = MigrationActions.migrateResourcesFolder();

      // when
      migrateResourcesFolder();

      // then
      const folders = getResourceFolders();
      expect(folders).toMatchSnapshot();
      verifyResources(oldHelpsExpected, oldBibleExpected);
    });

    it("test with t4t, old tHelps resources and not up to date resources - should remove old helps and keep old bibles", () => {
      // given
      const oldHelpsExpected = false;
      const oldBibleExpected = true;
      fs.copySync(STATIC_RESOURCES_PATH, USER_RESOURCES_PATH);
      const manifestPath = path.join(USER_RESOURCES_PATH, 'source-content-updater-manifest.json');
      const manifest = fs.readJsonSync(manifestPath);
      manifest[TC_VERSION] = APP_VERSION; // add app version to resource
      manifest.modified = "2014" + manifest.modified.substr(4);
      fs.outputJsonSync(manifestPath, manifest);
      fs.copySync(path.join(STATIC_RESOURCES_PATH, "en/bibles/ult"), path.join(USER_RESOURCES_PATH, "en/bibles/t4t"));
      fs.copySync(path.join(STATIC_RESOURCES_PATH, "hi/translationHelps/translationWords"), path.join(USER_RESOURCES_PATH, "x-test/translationHelps/translationWords"));
      const migrateResourcesFolder = MigrationActions.migrateResourcesFolder();

      // when
      migrateResourcesFolder();

      // then
      const folders = getResourceFolders();
      expect(folders).toMatchSnapshot();
      verifyResources(oldHelpsExpected, oldBibleExpected);
    });

    it("test with t4t, old tHelps resources and up to date resources - should not delete anything", () => {
      // given
      const oldHelpsExpected = true;
      const oldBibleExpected = true;
      fs.copySync(STATIC_RESOURCES_PATH, USER_RESOURCES_PATH);
      const manifestPath = path.join(USER_RESOURCES_PATH, 'source-content-updater-manifest.json');
      const manifest = fs.readJsonSync(manifestPath);
      manifest[TC_VERSION] = APP_VERSION; // add app version to resource
      manifest.modified = "9999" + manifest.modified.substr(4);
      fs.outputJsonSync(manifestPath, manifest);
      fs.copySync(path.join(STATIC_RESOURCES_PATH, "en/bibles/ult"), path.join(USER_RESOURCES_PATH, "en/bibles/t4t"));
      fs.copySync(path.join(STATIC_RESOURCES_PATH, "hi/translationHelps/translationWords"), path.join(USER_RESOURCES_PATH, "x-test/translationHelps/translationWords"));
      const migrateResourcesFolder = MigrationActions.migrateResourcesFolder();

      // when
      migrateResourcesFolder();

      // then
      const folders = getResourceFolders();
      expect(folders).toMatchSnapshot();
      verifyResources(oldHelpsExpected, oldBibleExpected);
    });

    it("test with old tHelps resources - should delete", () => {
      // given
      const oldHelpsExpected = false;
      const oldBibleExpected = false;
      fs.copySync(path.join(STATIC_RESOURCES_PATH, "hi/translationHelps/translationWords"), path.join(USER_RESOURCES_PATH, "x-test/translationHelps/translationWords"));
      const migrateResourcesFolder = MigrationActions.migrateResourcesFolder();

      // when
      migrateResourcesFolder();

      // then
      const folders = getResourceFolders();
      expect(folders).toMatchSnapshot();
      verifyResources(oldHelpsExpected, oldBibleExpected);
    });
  });

  describe('Test grc resource migration', () => {
    it("test with xx in grc/bible - should migrate to el-x-koine", () => {
      // given
      const oldHelpsExpected = false;
      const oldBibleExpected = true;
      const bibleId = 'xx';
      fs.copySync(path.join(STATIC_RESOURCES_PATH, "el-x-koine/bibles/ugnt"), path.join(USER_RESOURCES_PATH, "grc/bibles", bibleId));
      const migrateResourcesFolder = MigrationActions.migrateResourcesFolder();

      // when
      migrateResourcesFolder();

      // then
      const folders = getResourceFolders();
      expect(folders).toMatchSnapshot();
      verifyResources(oldHelpsExpected, oldBibleExpected, "el-x-koine/bibles/" + bibleId);
      expect(fs.existsSync(path.join(USER_RESOURCES_PATH, 'grc'))).toBeFalsy(); // should remove folder
    });

    it("test with older version of xx in grc/bible - should not move", () => {
      // given
      const oldHelpsExpected = false;
      const oldBibleExpected = true;
      const bibleId = 'xx';
      fs.copySync(path.join(STATIC_RESOURCES_PATH, "el-x-koine/bibles/ugnt"), path.join(USER_RESOURCES_PATH, "el-x-koine/bibles", bibleId));
      fs.copySync(path.join(USER_RESOURCES_PATH, "el-x-koine/bibles", bibleId, "v0.2"), path.join(USER_RESOURCES_PATH, "grc/bibles", bibleId, "v0.1"));
      const migrateResourcesFolder = MigrationActions.migrateResourcesFolder();

      // when
      migrateResourcesFolder();

      // then
      const folders = getResourceFolders();
      expect(folders).toMatchSnapshot();
      verifyResources(oldHelpsExpected, oldBibleExpected, "el-x-koine/bibles/" + bibleId);
      expect(fs.existsSync(path.join(USER_RESOURCES_PATH, 'grc'))).toBeFalsy(); // should remove folder
    });

    it("test with older version of ugnt in grc/bible - should be removed", () => {
      // given
      const oldHelpsExpected = false;
      const oldBibleExpected = true;
      const bibleId = 'ugnt';
      fs.copySync(path.join(STATIC_RESOURCES_PATH, "el-x-koine/bibles", bibleId, "v0.2"), path.join(USER_RESOURCES_PATH, "grc/bibles", bibleId, "v0.1"));
      const migrateResourcesFolder = MigrationActions.migrateResourcesFolder();

      // when
      migrateResourcesFolder();

      // then
      const folders = getResourceFolders();
      expect(folders).toMatchSnapshot();
      verifyResources(oldHelpsExpected, oldBibleExpected, "el-x-koine/bibles/" + bibleId);
      expect(fs.existsSync(path.join(USER_RESOURCES_PATH, 'grc'))).toBeFalsy(); // should remove folder
    });

    //?? // TODO add test for upgrading original language

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
 * @param {Boolean} expected - if true then resource expected, else should not be present
 */
function verifyResourceExpected(resource, expected) {
  const resourceFolder = path.join(USER_RESOURCES_PATH, resource);
  let present = fs.existsSync(resourceFolder);
  if (present) {
    const versions = getFoldersInResourceFolder(resourceFolder);
    present = versions.length > 0;
  }
  if (present !== expected) {
    const presentText = (expected ? "" : "not ") + " to be present";
    console.log(`Expect ${resourceFolder} ${presentText}`);
    expect(present).toEqual(expected);
  }
}

function verifyResources(oldHelpsExpected, oldBibleExpected, bibleId = 'en/bibles/t4t') {
  verifyResourceExpected("x-test/translationHelps/translationWords", oldHelpsExpected);
  verifyResourceExpected(bibleId, oldBibleExpected);
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
