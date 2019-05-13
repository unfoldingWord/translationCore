/* eslint-env jest */

// ResourcesHelpers tests with mocking

import ResourceAPI from "../src/js/helpers/ResourceAPI";
import path from 'path';
import ospath from "ospath";
import fs from "fs-extra";
import thunk from "redux-thunk";
import configureMockStore from "redux-mock-store";
import _ from "lodash";
// helpers
import * as ResourcesHelpers from '../src/js/helpers/ResourcesHelpers';
import {APP_VERSION} from "../src/js/containers/home/HomeContainer";
import {TC_VERSION} from "../src/js/helpers/ResourcesHelpers";
import {USER_RESOURCES_PATH} from "../src/js/helpers/ResourcesHelpers";

jest.mock('fs-extra');
jest.mock('adm-zip');

// constants
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
const PROJECTS_PATH = path.join(ospath.home(), 'translationCore', 'projects');
const RESOURCE_PATH = path.join(ospath.home(), 'translationCore', 'resources');
const STATIC_RESOURCES_PATH = ResourcesHelpers.STATIC_RESOURCES_PATH;

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
    fs.ensureDirSync(path.join(RESOURCE_PATH, 'en'));
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

describe('ResourcesHelpers.getMissingResources', () => {
  describe('restore lexicons', () => {
    let latestUGL = null;
    let latestUHL = null;

    beforeAll(() => {
      fs.__resetMockFS();
      loadMockFsWithlexicons();
      fs.ensureDirSync(path.join(RESOURCE_PATH, 'en'));
      latestUGL = path.basename(ResourceAPI.getLatestVersion(path.join(STATIC_RESOURCES_PATH, 'en/lexicons/ugl')));
      latestUHL = path.basename(ResourceAPI.getLatestVersion(path.join(STATIC_RESOURCES_PATH, 'en/lexicons/uhl')));
    });

    beforeEach(() => {
      const lexiconsPath = 'en/lexicons';
      const lexiconResourcePath = path.join(RESOURCE_PATH, lexiconsPath);
      fs.removeSync(lexiconResourcePath);
    });

    it('should copy missing uhl and ugl lexicons', () => {
      const lexiconsPath = 'en/lexicons';
      const expectedLexicons = ['ugl/' + latestUGL, 'uhl/' + latestUHL];
      const lexiconResourcePath = path.join(RESOURCE_PATH, lexiconsPath);

      // when
      ResourcesHelpers.getMissingResources();

      // then
      verifyLexicons(expectedLexicons, lexiconResourcePath);
    });

    it('should copy missing uhl lexicon', () => {
      const lexiconsPath = 'en/lexicons';
      const expectedLexicons = ['ugl/' + latestUGL, 'uhl/' + latestUHL];
      const lexiconResourcePath = path.join(RESOURCE_PATH, lexiconsPath);
      fs.ensureDirSync(path.join(lexiconResourcePath, 'ugl', latestUGL));

      // when
      ResourcesHelpers.getMissingResources();

      // then
      verifyLexicons(expectedLexicons, lexiconResourcePath);
    });

    it('should copy latest uhl lexicon', () => {
      const lexiconsPath = 'en/lexicons';
      const expectedLexicons = ['ugl/' + latestUGL, 'uhl/' + latestUHL];
      const lexiconResourcePath = path.join(RESOURCE_PATH, lexiconsPath);
      fs.ensureDirSync(path.join(lexiconResourcePath, 'ugl', latestUGL));
      fs.ensureDirSync(path.join(lexiconResourcePath, 'uhl', 'v0'));

      // when
      ResourcesHelpers.getMissingResources();

      // then
      verifyLexicons(expectedLexicons, lexiconResourcePath);
    });

    it('should work with no missing lexicons', () => {
      const lexiconsPath = 'en/lexicons';
      const expectedLexicons = ['ugl/' + latestUGL, 'uhl/' + latestUHL];
      const lexiconResourcePath = path.join(RESOURCE_PATH, lexiconsPath);
      fs.ensureDirSync(path.join(lexiconResourcePath, 'ugl', latestUGL));
      fs.ensureDirSync(path.join(lexiconResourcePath, 'uhl', latestUHL));

      // when
      ResourcesHelpers.getMissingResources();

      // then
      verifyLexicons(expectedLexicons, lexiconResourcePath);
    });
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

describe('ResourcesHelpers.extractZippedBooks', () => {
  it('works as expected', () => {
    const EN_ULB_PATH = path.join(RESOURCE_PATH, 'en', 'ult');
    const versionPath = path.join(RESOURCE_PATH, 'en', 'ult', 'v11');
    const zippedBooks = path.join(EN_ULB_PATH, 'v11', 'books.zip');

    fs.__setMockFS({
      [EN_ULB_PATH]: ['v11'],
      [versionPath]: [],
      [zippedBooks]: []
    });

    ResourcesHelpers.extractZippedBooks(EN_ULB_PATH);
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
  const resourcesPath = RESOURCE_PATH;
  const copyResourceFiles = [
    'en/bibles/ult',
    'en/bibles/ust',
    'grc/bibles/ugnt',
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
  const resourcesManifestPath = path.join(RESOURCE_PATH, "source-content-updater-manifest.json");
  fs.ensureDirSync(RESOURCE_PATH);
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
