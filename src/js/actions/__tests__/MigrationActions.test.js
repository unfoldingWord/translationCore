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
    fs.__loadFilesIntoMockFs(['source-content-updater-manifest.json'], STATIC_RESOURCES_PATH, STATIC_RESOURCES_PATH);
  });

  it("test with no user resources", () => {
    // given
    const migrateResourcesFolder = MigrationActions.migrateResourcesFolder();

    // when
    migrateResourcesFolder();
    // then
    const folders = getResourceFolders();
    expect(folders).toMatchSnapshot();
  });

  it("test with t4t - should not delete", () => {
    // given
    fs.copySync(path.join(STATIC_RESOURCES_PATH, "en/bibles/ult"), path.join(USER_RESOURCES_PATH, "en/bibles/t4t"));
    const migrateResourcesFolder = MigrationActions.migrateResourcesFolder();

    // when
    migrateResourcesFolder();

    // then
    const folders = getResourceFolders();
    expect(folders).toMatchSnapshot();
  });

  it("test with t4t, old resources and up to date resources - should not delete anything", () => {
    // given
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
  });

  it("test with t4t, old resources, up to date resources and different app version - should remove old helps and keep old bibles", () => {
    // given
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
  });

  it("test with t4t, old resources and not up to date resources - should remove old helps and keep old bibles", () => {
    // given
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
  });

  it("test with t4t, old resources and up to date resources - should not delete anything", () => {
    // given
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
  });

  it("test with old resources - should delete", () => {
    // given
    fs.copySync(path.join(STATIC_RESOURCES_PATH, "hi/translationHelps/translationWords"), path.join(USER_RESOURCES_PATH, "x-test/translationHelps/translationWords"));
    const migrateResourcesFolder = MigrationActions.migrateResourcesFolder();

    // when
    migrateResourcesFolder();

    // then
    const folders = getResourceFolders();
    expect(folders).toMatchSnapshot();
  });
});

//
// Helpers
//

function toLinuxPath(filePath) {
  const newPath = filePath.split(path.sep).join(path.posix.sep);
  return newPath;
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
        const resourcePath = toLinuxPath(path.join(resourcesPath, resource));
        paths.push(resourcePath);
      }
    }
  }
  return paths;
}
