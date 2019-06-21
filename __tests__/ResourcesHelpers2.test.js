/* eslint-env jest */
jest.mock('fs-extra');
jest.mock('adm-zip');
import path from 'path';
import fs from "fs-extra";
import thunk from "redux-thunk";
import configureMockStore from "redux-mock-store";
import _ from "lodash";
// helpers
import * as ResourcesHelpers from '../src/js/helpers/ResourcesHelpers';
// constants
import {
  APP_VERSION,
  TC_VERSION,
  USER_RESOURCES_PATH,
  PROJECTS_PATH,
  STATIC_RESOURCES_PATH,
} from '../src/js/common/constants';
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('ResourcesHelpers.getResourcesNeededByTool', () => {
  it('getResourcesNeededByTool() should work', () => {
    const bookId = 'gal';
    const store = {
      resourcesReducer: {
        bibles: {},
        translationHelps: {},
        lexicons: {}
      },
      contextIdReducer: {
        contextId: {
          reference: {
            bookId: bookId,
            chapter:1
          }
        }
      },
      settingsReducer: {
        toolsSettings: {
          ScripturePane: {
            currentPaneSettings: [
              {
                bibleId: "targetBible",
                languageId: "targetLanguage"
              }, {
                bibleId: "ugnt",
                languageId: "originalLanguage"
              }, {
                bibleId: "ust",
                languageId: "en"
              }, {
                bibleId: "ult",
                languageId: "en"
              }
            ]
          }
        }
      }
    };
    loadMockFsWithProjectAndResources();

    // when
    const resourceList = ResourcesHelpers.getResourcesNeededByTool(store, bookId);

    // then
    expect(resourceList).toMatchSnapshot();
  });
});

describe('ResourcesHelpers.getAvailableScripturePaneSelections', () => {
  beforeAll(() => {
    fs.__resetMockFS();
    loadMockFsWithProjectAndResources();
    fs.ensureDirSync(path.join(USER_RESOURCES_PATH, 'en'));
  });

  it('getAvailableScripturePaneSelections() should work', () => {
    const bookId = 'gal';
    const store =  mockStore({
      resourcesReducer: {
        bibles: {
          targetLanguage: {
            targetBible: {
              manifest: {}
            }
          }
        },
        translationHelps: {},
        lexicons: {}
      },
      contextIdReducer: {
        contextId: {
          reference: {
            bookId: bookId,
            chapter:1
          }
        }
      },
      settingsReducer: {
        toolsSettings: {
          ScripturePane: {
            currentPaneSettings: [
              {
                bibleId: "targetBible",
                languageId: "targetLanguage"
              }, {
                bibleId: "ugnt",
                languageId: "originalLanguage"
              }, {
                bibleId: "ust",
                languageId: "en"
              }, {
                bibleId: "ult",
                languageId: "en"
              }
            ]
          }
        }
      }
    });
    const resourceList = [];

    // when
    store.dispatch(
      ResourcesHelpers.getAvailableScripturePaneSelections(resourceList)
    );

    // then
    expect(cleanupResources(resourceList)).toMatchSnapshot();
  });

  it('getAvailableScripturePaneSelections() should work OT', () => {
    const bookId = 'jol';
    const store =  mockStore({
      resourcesReducer: {
        bibles: {
          targetLanguage: {
            targetBible: {
              manifest: {}
            }
          }
        },
        translationHelps: {},
        lexicons: {}
      },
      contextIdReducer: {
        contextId: {
          reference: {
            bookId: bookId,
            chapter:1
          }
        }
      },
      settingsReducer: {
        toolsSettings: {
          ScripturePane: {
            currentPaneSettings: [
              {
                bibleId: "targetBible",
                languageId: "targetLanguage"
              }, {
                bibleId: "uhb",
                languageId: "originalLanguage"
              }, {
                bibleId: "ust",
                languageId: "en"
              }, {
                bibleId: "ult",
                languageId: "en"
              }
            ]
          }
        }
      }
    });

    const resourceList = [];

    // when
    store.dispatch(
      ResourcesHelpers.getAvailableScripturePaneSelections(resourceList)
    );

    // then
    expect(cleanupResources(resourceList)).toMatchSnapshot();
  });

  it('getAvailableScripturePaneSelections() should work without targetBible loaded into resources', () => {
    const bookId = 'gal';
    const store =  mockStore({
      resourcesReducer: {
        bibles: {},
        translationHelps: {},
        lexicons: {}
      },
      contextIdReducer: {
        contextId: {
          reference: {
            bookId: bookId,
            chapter:1
          }
        }
      },
      settingsReducer: {
        toolsSettings: {
          ScripturePane: {
            currentPaneSettings: [
              {
                bibleId: "targetBible",
                languageId: "targetLanguage"
              }, {
                bibleId: "ugnt",
                languageId: "originalLanguage"
              }, {
                bibleId: "ust",
                languageId: "en"
              }, {
                bibleId: "ult",
                languageId: "en"
              }
            ]
          }
        }
      }
    });
    const resourceList = [];

    // when
    store.dispatch(
      ResourcesHelpers.getAvailableScripturePaneSelections(resourceList)
    );

    // then
    expect(cleanupResources(resourceList)).toMatchSnapshot();
  });
});

describe('ResourcesHelpers.areResourcesNewer()', () => {
  beforeEach(() => {
    fs.__resetMockFS();
  });

  test('same date should return false', () => {
    // given
    const bundledDate = "2019-04-02T19:10:02.492Z";
    const userDate = "2019-04-02T19:10:02.492Z";
    const expectedNewer = false;
    loadSourceContentUpdaterManifests(bundledDate, userDate);

    // when
    const results = ResourcesHelpers.areResourcesNewer();

    // then
    expect(results).toEqual(expectedNewer);
  });

  test('newer bundled date should return true', () => {
    // given
    const bundledDate = "2019-04-02T19:10:02.492Z";
    const userDate = "2018-04-02T19:10:02.492Z";
    const expectedNewer = true;
    loadSourceContentUpdaterManifests(bundledDate, userDate);

    // when
    const results = ResourcesHelpers.areResourcesNewer();

    // then
    expect(results).toEqual(expectedNewer);
  });

  test('newer user date should return false', () => {
    // given
    const bundledDate = "2019-04-02T19:10:02.492Z";
    const userDate = "2019-08-02T19:10:02.492Z";
    const expectedNewer = false;
    loadSourceContentUpdaterManifests(bundledDate, userDate);

    // when
    const results = ResourcesHelpers.areResourcesNewer();

    // then
    expect(results).toEqual(expectedNewer);
  });

  test('missing user resource manifest should return true', () => {
    // given
    const bundledDate = "2019-04-02T19:10:02.492Z";
    const userDate = null;
    const expectedNewer = true;
    loadSourceContentUpdaterManifests(bundledDate, userDate);

    // when
    const results = ResourcesHelpers.areResourcesNewer();

    // then
    expect(results).toEqual(expectedNewer);
  });

  test('missing bundled resource manifest should return false', () => {
    // given
    const bundledDate = null;
    const userDate = "2019-04-02T19:10:02.492Z";
    const expectedNewer = false;
    loadSourceContentUpdaterManifests(bundledDate, userDate);

    // when
    const results = ResourcesHelpers.areResourcesNewer();

    // then
    expect(results).toEqual(expectedNewer);
  });

  test('same date, but missing version should return true', () => {
    // given
    const bundledDate = "2019-04-02T19:10:02.492Z";
    const userDate = "2019-04-02T19:10:02.492Z";
    const expectedNewer = true;
    const appVersion = null;
    loadSourceContentUpdaterManifests(bundledDate, userDate, appVersion);

    // when
    const results = ResourcesHelpers.areResourcesNewer();

    // then
    expect(results).toEqual(expectedNewer);
  });

  test('same date, but different version should return true', () => {
    // given
    const bundledDate = "2019-04-02T19:10:02.492Z";
    const userDate = "2019-04-02T19:10:02.492Z";
    const expectedNewer = true;
    const appVersion = "1.1.0";
    loadSourceContentUpdaterManifests(bundledDate, userDate, appVersion);

    // when
    const results = ResourcesHelpers.areResourcesNewer();

    // then
    expect(results).toEqual(expectedNewer);
  });
});

describe('ResourcesHelpers.updateSourceContentUpdaterManifest()', () => {

  beforeEach(() => {
    fs.__resetMockFS();
  });

  test('should update date and app version if manifest missing', () => {
    // given
    const dateStr = '1997-12-17T08:24:00.000Z';
    const manifestPath = path.join(USER_RESOURCES_PATH,
      "source-content-updater-manifest.json");
    expect(fs.existsSync(manifestPath)).not.toBeTruthy();

    // when
    ResourcesHelpers.updateSourceContentUpdaterManifest(dateStr);

    // then
    const manifest = fs.readJSONSync(manifestPath);
    expect(manifest[TC_VERSION]).toEqual(APP_VERSION);
    expect(manifest.modified).toEqual(dateStr);
  });

  test('should update date if manifest present', () => {
    // given
    const dateStr = '1997-12-17T08:24:00.000Z';
    const userDate = "2019-04-02T19:10:02.492Z";
    loadSourceContentUpdaterManifests("", userDate);
    const manifestPath = path.join(USER_RESOURCES_PATH,
      "source-content-updater-manifest.json");
    expect(fs.existsSync(manifestPath)).toBeTruthy();

    // when
    ResourcesHelpers.updateSourceContentUpdaterManifest(dateStr);

    // then
    const manifest = fs.readJSONSync(manifestPath);
    expect(manifest[TC_VERSION]).toEqual(APP_VERSION);
    expect(manifest.modified).toEqual(dateStr);
  });

  test('should update app version if manifest present', () => {
    // given
    const dateStr = '1997-12-17T08:24:00.000Z';
    const initialAppVersion = "1.0.1";
    loadSourceContentUpdaterManifests("", dateStr, initialAppVersion);
    const manifestPath = path.join(USER_RESOURCES_PATH,
      "source-content-updater-manifest.json");
    expect(fs.existsSync(manifestPath)).toBeTruthy();

    // when
    ResourcesHelpers.updateSourceContentUpdaterManifest(dateStr);

    // then
    const manifest = fs.readJSONSync(manifestPath);
    expect(manifest[TC_VERSION]).toEqual(APP_VERSION);
    expect(manifest.modified).toEqual(dateStr);
  });
});

describe('ResourcesHelpers.copySourceContentUpdaterManifest()', () => {

  beforeEach(() => {
    fs.__resetMockFS();
  });

  test('should update app version after copy', () => {
    // given
    const dateStr = '1997-12-17T08:24:00.000Z';
    loadSourceContentUpdaterManifests(dateStr, null, null);
    const staticManifestPath = path.join(STATIC_RESOURCES_PATH,
      "source-content-updater-manifest.json");
    expect(fs.existsSync(staticManifestPath)).toBeTruthy();

    // when
    ResourcesHelpers.copySourceContentUpdaterManifest(dateStr);

    // then
    const manifestPath = path.join(USER_RESOURCES_PATH,
      "source-content-updater-manifest.json");
    const manifest = fs.readJSONSync(manifestPath);
    expect(manifest[TC_VERSION]).toEqual(APP_VERSION);
    expect(manifest.modified).toEqual(dateStr);
  });
});

describe('ResourcesHelpers.extractZippedResourceContent', () => {
  it('works as expected', () => {
    const EN_ULB_PATH = path.join(USER_RESOURCES_PATH, 'en', 'ult');
    const versionPath = path.join(USER_RESOURCES_PATH, 'en', 'ult', 'v11');
    const zippedBooks = path.join(EN_ULB_PATH, 'v11', 'books.zip');
    const isBible = true;

    fs.__setMockFS({
      [EN_ULB_PATH]: ['v11'],
      [versionPath]: [],
      [zippedBooks]: []
    });

    ResourcesHelpers.extractZippedResourceContent(EN_ULB_PATH, isBible);
    expect(fs.existsSync(zippedBooks)).toBeFalsy();
  });
});

//
// helpers
//

function cleanupResources(resourceList) {
  const newResourceList = [];
  for (let resource of resourceList) {
    const resource_ = _.cloneDeep(resource); // make copy
    expect (resource_.manifest).not.toBeUndefined();
    resource_.manifest = "manifest";
    newResourceList.push(resource_);
  }
  return newResourceList;
}

function loadMockFsWithProjectAndResources() {
  const sourcePath = path.join('__tests__', 'fixtures', 'project');
  const copyFiles = ['en_gal'];
  fs.__loadFilesIntoMockFs(copyFiles, sourcePath, PROJECTS_PATH);

  const sourceResourcesPath = path.join('__tests__', 'fixtures', 'resources');
  const resourcesPath = USER_RESOURCES_PATH;
  const copyResourceFiles = [
    'en/bibles/ult',
    'en/bibles/ust',
    'el-x-koine/bibles/ugnt',
    'hbo/bibles/uhb',
    'en/translationHelps/translationWords',
    'en/translationHelps/translationAcademy',
    'hi/translationHelps/translationWords'];
  fs.__loadFilesIntoMockFs(copyResourceFiles, sourceResourcesPath, resourcesPath);
}

function loadMockFsWithlexicons() {
  const sourceResourcesPath = STATIC_RESOURCES_PATH;
  const resourcesPath = STATIC_RESOURCES_PATH;
  const copyResourceFiles = ['en/lexicons'];
  fs.__loadFilesIntoMockFs(copyResourceFiles, sourceResourcesPath, resourcesPath);
}

function loadSourceContentUpdaterManifests(bundledDate, userDate, appVersion = APP_VERSION) {
  const bundledResourcesManifestPath = path.join(STATIC_RESOURCES_PATH, "source-content-updater-manifest.json");
  fs.ensureDirSync(STATIC_RESOURCES_PATH);
  if (bundledDate) {
    fs.outputJsonSync(bundledResourcesManifestPath, {modified: bundledDate});
  }
  const resourcesManifestPath = path.join(USER_RESOURCES_PATH, "source-content-updater-manifest.json");
  fs.ensureDirSync(USER_RESOURCES_PATH);
  if (userDate) {
    const manifest = {modified: userDate};
    if (typeof appVersion === 'string') {
      manifest[TC_VERSION] = appVersion; // add app version to resource
    }
    fs.outputJsonSync(resourcesManifestPath, manifest);
  }
}

function verifyLexicons(expectedLexicons, lexiconResourcePath) {
  for (let lexicon of expectedLexicons) {
    const folderPath = path.join(lexiconResourcePath, lexicon);
    const folderExists = fs.lstatSync(folderPath).isDirectory();
    expect(folderExists).toBeTruthy();
  }
}
