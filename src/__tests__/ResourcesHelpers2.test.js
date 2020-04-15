/* eslint-env jest */
import path from 'path';
import fs from 'fs-extra';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import _ from 'lodash';
// helpers
import { getContextIdPathFromIndex } from '../js/helpers/contextIdHelpers';
import {
  areResourcesNewer,
  copySourceContentUpdaterManifest,
  extractZippedResourceContent,
  findArticleFilePath,
  getAvailableScripturePaneSelections,
  getResourcesNeededByTool,
  loadArticleData,
  updateSourceContentUpdaterManifest,
  updateGroupIndexForGl,
} from '../js/helpers/ResourcesHelpers';
// constants
import {
  APP_VERSION,
  ORIGINAL_LANGUAGE,
  PROJECTS_PATH,
  STATIC_RESOURCES_PATH,
  TARGET_BIBLE,
  TARGET_LANGUAGE,
  TC_VERSION,
  TRANSLATION_ACADEMY,
  TRANSLATION_HELPS,
  TRANSLATION_WORDS,
  TRANSLATION_NOTES,
  USER_RESOURCES_PATH,
} from '../js/common/constants';
jest.mock('fs-extra');
jest.mock('adm-zip');

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('getResourcesNeededByTool()', () => {
  it('should work', () => {
    const bookId = 'gal';
    const store = {
      resourcesReducer: {
        bibles: {},
        translationHelps: {},
        lexicons: {},
      },
      contextIdReducer: {
        contextId: {
          reference: {
            bookId: bookId,
            chapter:1,
          },
        },
      },
      settingsReducer: {
        toolsSettings: {
          ScripturePane: {
            currentPaneSettings: [
              {
                bibleId: TARGET_BIBLE,
                languageId: TARGET_LANGUAGE,
              }, {
                bibleId: 'ugnt',
                languageId: ORIGINAL_LANGUAGE,
              }, {
                bibleId: 'ust',
                languageId: 'en',
              }, {
                bibleId: 'ult',
                languageId: 'en',
              },
            ],
          },
        },
      },
    };
    loadMockFsWithProjectAndResources();

    // when
    const resourceList = getResourcesNeededByTool(store, bookId);

    // then
    expect(resourceList).toMatchSnapshot();
  });
});

describe('getAvailableScripturePaneSelections', () => {
  beforeAll(() => {
    fs.__resetMockFS();
    loadMockFsWithProjectAndResources();
    fs.ensureDirSync(path.join(USER_RESOURCES_PATH, 'en'));
  });

  it('should work', () => {
    const bookId = 'gal';
    const store = mockStore({
      resourcesReducer: {
        bibles: { targetLanguage: { targetBible: { manifest: {} } } },
        translationHelps: {},
        lexicons: {},
      },
      contextIdReducer: {
        contextId: {
          reference: {
            bookId: bookId,
            chapter:1,
          },
        },
      },
      settingsReducer: {
        toolsSettings: {
          ScripturePane: {
            currentPaneSettings: [
              {
                bibleId: TARGET_BIBLE,
                languageId: TARGET_LANGUAGE,
              }, {
                bibleId: 'ugnt',
                languageId: ORIGINAL_LANGUAGE,
              }, {
                bibleId: 'ust',
                languageId: 'en',
              }, {
                bibleId: 'ult',
                languageId: 'en',
              },
            ],
          },
        },
      },
    });
    const resourceList = [];

    // when
    store.dispatch(getAvailableScripturePaneSelections(resourceList));

    // then
    expect(cleanupResources(resourceList)).toMatchSnapshot();
  });

  it('should work OT', () => {
    const bookId = 'jol';
    const store = mockStore({
      resourcesReducer: {
        bibles: { targetLanguage: { targetBible: { manifest: {} } } },
        translationHelps: {},
        lexicons: {},
      },
      contextIdReducer: {
        contextId: {
          reference: {
            bookId: bookId,
            chapter:1,
          },
        },
      },
      settingsReducer: {
        toolsSettings: {
          ScripturePane: {
            currentPaneSettings: [
              {
                bibleId: TARGET_BIBLE,
                languageId: TARGET_LANGUAGE,
              }, {
                bibleId: 'uhb',
                languageId: ORIGINAL_LANGUAGE,
              }, {
                bibleId: 'ust',
                languageId: 'en',
              }, {
                bibleId: 'ult',
                languageId: 'en',
              },
            ],
          },
        },
      },
    });

    const resourceList = [];

    // when
    store.dispatch(getAvailableScripturePaneSelections(resourceList));

    // then
    expect(cleanupResources(resourceList)).toMatchSnapshot();
  });

  it('getAvailableScripturePaneSelections() should work without targetBible loaded into resources', () => {
    const bookId = 'gal';
    const store = mockStore({
      resourcesReducer: {
        bibles: {},
        translationHelps: {},
        lexicons: {},
      },
      contextIdReducer: {
        contextId: {
          reference: {
            bookId: bookId,
            chapter:1,
          },
        },
      },
      settingsReducer: {
        toolsSettings: {
          ScripturePane: {
            currentPaneSettings: [
              {
                bibleId: TARGET_BIBLE,
                languageId: TARGET_LANGUAGE,
              }, {
                bibleId: 'ugnt',
                languageId: ORIGINAL_LANGUAGE,
              }, {
                bibleId: 'ust',
                languageId: 'en',
              }, {
                bibleId: 'ult',
                languageId: 'en',
              },
            ],
          },
        },
      },
    });
    const resourceList = [];

    // when
    store.dispatch(getAvailableScripturePaneSelections(resourceList));

    // then
    expect(cleanupResources(resourceList)).toMatchSnapshot();
  });
});

describe('areResourcesNewer()', () => {
  beforeEach(() => {
    fs.__resetMockFS();
  });

  test('same date should return false', () => {
    // given
    const bundledDate = '2019-04-02T19:10:02.492Z';
    const userDate = '2019-04-02T19:10:02.492Z';
    const expectedNewer = false;
    loadSourceContentUpdaterManifests(bundledDate, userDate);

    // when
    const results = areResourcesNewer();

    // then
    expect(results).toEqual(expectedNewer);
  });

  test('newer bundled date should return true', () => {
    // given
    const bundledDate = '2019-04-02T19:10:02.492Z';
    const userDate = '2018-04-02T19:10:02.492Z';
    const expectedNewer = true;
    loadSourceContentUpdaterManifests(bundledDate, userDate);

    // when
    const results = areResourcesNewer();

    // then
    expect(results).toEqual(expectedNewer);
  });

  test('newer user date should return false', () => {
    // given
    const bundledDate = '2019-04-02T19:10:02.492Z';
    const userDate = '2019-08-02T19:10:02.492Z';
    const expectedNewer = false;
    loadSourceContentUpdaterManifests(bundledDate, userDate);

    // when
    const results = areResourcesNewer();

    // then
    expect(results).toEqual(expectedNewer);
  });

  test('missing user resource manifest should return true', () => {
    // given
    const bundledDate = '2019-04-02T19:10:02.492Z';
    const userDate = null;
    const expectedNewer = true;
    loadSourceContentUpdaterManifests(bundledDate, userDate);

    // when
    const results = areResourcesNewer();

    // then
    expect(results).toEqual(expectedNewer);
  });

  test('missing bundled resource manifest should return false', () => {
    // given
    const bundledDate = null;
    const userDate = '2019-04-02T19:10:02.492Z';
    const expectedNewer = false;
    loadSourceContentUpdaterManifests(bundledDate, userDate);

    // when
    const results = areResourcesNewer();

    // then
    expect(results).toEqual(expectedNewer);
  });

  test('same date, but missing version should return true', () => {
    // given
    const bundledDate = '2019-04-02T19:10:02.492Z';
    const userDate = '2019-04-02T19:10:02.492Z';
    const expectedNewer = true;
    const appVersion = null;
    loadSourceContentUpdaterManifests(bundledDate, userDate, appVersion);

    // when
    const results = areResourcesNewer();

    // then
    expect(results).toEqual(expectedNewer);
  });

  test('same date, but different version should return true', () => {
    // given
    const bundledDate = '2019-04-02T19:10:02.492Z';
    const userDate = '2019-04-02T19:10:02.492Z';
    const expectedNewer = true;
    const appVersion = '1.1.0';
    loadSourceContentUpdaterManifests(bundledDate, userDate, appVersion);

    // when
    const results = areResourcesNewer();

    // then
    expect(results).toEqual(expectedNewer);
  });
});

describe('updateSourceContentUpdaterManifest()', () => {
  beforeEach(() => {
    fs.__resetMockFS();
  });

  test('should update date and app version if manifest missing', () => {
    // given
    const dateStr = '1997-12-17T08:24:00.000Z';
    const manifestPath = path.join(USER_RESOURCES_PATH,
      'source-content-updater-manifest.json');
    expect(fs.existsSync(manifestPath)).not.toBeTruthy();

    // when
    updateSourceContentUpdaterManifest(dateStr);

    // then
    const manifest = fs.readJSONSync(manifestPath);
    expect(manifest[TC_VERSION]).toEqual(APP_VERSION);
    expect(manifest.modified).toEqual(dateStr);
  });

  test('should update date if manifest present', () => {
    // given
    const dateStr = '1997-12-17T08:24:00.000Z';
    const userDate = '2019-04-02T19:10:02.492Z';
    loadSourceContentUpdaterManifests('', userDate);
    const manifestPath = path.join(USER_RESOURCES_PATH,
      'source-content-updater-manifest.json');
    expect(fs.existsSync(manifestPath)).toBeTruthy();

    // when
    updateSourceContentUpdaterManifest(dateStr);

    // then
    const manifest = fs.readJSONSync(manifestPath);
    expect(manifest[TC_VERSION]).toEqual(APP_VERSION);
    expect(manifest.modified).toEqual(dateStr);
  });

  test('should update app version if manifest present', () => {
    // given
    const dateStr = '1997-12-17T08:24:00.000Z';
    const initialAppVersion = '1.0.1';
    loadSourceContentUpdaterManifests('', dateStr, initialAppVersion);
    const manifestPath = path.join(USER_RESOURCES_PATH,
      'source-content-updater-manifest.json');
    expect(fs.existsSync(manifestPath)).toBeTruthy();

    // when
    updateSourceContentUpdaterManifest(dateStr);

    // then
    const manifest = fs.readJSONSync(manifestPath);
    expect(manifest[TC_VERSION]).toEqual(APP_VERSION);
    expect(manifest.modified).toEqual(dateStr);
  });
});

describe('copySourceContentUpdaterManifest()', () => {
  beforeEach(() => {
    fs.__resetMockFS();
  });

  test('should update app version after copy', () => {
    // given
    const dateStr = '1997-12-17T08:24:00.000Z';
    loadSourceContentUpdaterManifests(dateStr, null, null);
    const staticManifestPath = path.join(STATIC_RESOURCES_PATH,
      'source-content-updater-manifest.json');
    expect(fs.existsSync(staticManifestPath)).toBeTruthy();

    // when
    copySourceContentUpdaterManifest(dateStr);

    // then
    const manifestPath = path.join(USER_RESOURCES_PATH,
      'source-content-updater-manifest.json');
    const manifest = fs.readJSONSync(manifestPath);
    expect(manifest[TC_VERSION]).toEqual(APP_VERSION);
    expect(manifest.modified).toEqual(dateStr);
  });
});

describe('extractZippedResourceContent', () => {
  it('works as expected', () => {
    const EN_ULB_PATH = path.join(USER_RESOURCES_PATH, 'en', 'ult');
    const versionPath = path.join(USER_RESOURCES_PATH, 'en', 'ult', 'v11');
    const zippedBooks = path.join(EN_ULB_PATH, 'v11', 'books.zip');
    const isBible = true;

    fs.__setMockFS({
      [EN_ULB_PATH]: ['v11'],
      [versionPath]: [],
      [zippedBooks]: [],
    });

    extractZippedResourceContent(EN_ULB_PATH, isBible);
    expect(fs.existsSync(zippedBooks)).toBeFalsy();
  });
});

describe('findArticleFilePath()', () => {
  it('findArticleFilePath for abel in en', () => {
    loadMockFsWithProjectAndResources();
    const filePath = findArticleFilePath(TRANSLATION_WORDS, 'abel', 'en');
    const expectedPath = path.join(USER_RESOURCES_PATH, 'en', TRANSLATION_HELPS, TRANSLATION_WORDS, 'v10', 'names', 'articles', 'abel.md');
    expect(filePath).toEqual(expectedPath);
  });

  it('findArticleFilePath for a non-existing file', () => {
    loadMockFsWithProjectAndResources();
    const filePath = findArticleFilePath(TRANSLATION_WORDS, 'does-not-exist', 'en');
    expect(filePath).toBeNull();
  });

  it('findArticleFilePath for abraham which is not in Hindi, but search hindi first', () => {
    loadMockFsWithProjectAndResources();
    const filePath = findArticleFilePath(TRANSLATION_WORDS, 'abomination', 'hi');
    const expectedPath = path.join(USER_RESOURCES_PATH, 'hi', TRANSLATION_HELPS, TRANSLATION_WORDS, 'v8.1', 'kt', 'articles', 'abomination.md');
    expect(filePath).toEqual(expectedPath);
  });

  it('findArticleFilePath for abraham which is not in Hindi, but search hindi first', () => {
    loadMockFsWithProjectAndResources();
    const filePath = findArticleFilePath(TRANSLATION_WORDS, 'abraham', 'hi');
    const expectedPath = path.join(USER_RESOURCES_PATH, 'en', TRANSLATION_HELPS, TRANSLATION_WORDS, 'v10', 'names', 'articles', 'abraham.md');
    expect(filePath).toEqual(expectedPath);
  });

  it('findArticleFilePath for tA translate-names which is not in Hindi so should return English', () => {
    loadMockFsWithProjectAndResources();
    const filePath = findArticleFilePath(TRANSLATION_ACADEMY, 'translate-names', 'hi');
    const expectedPath = path.join(USER_RESOURCES_PATH, 'en', TRANSLATION_HELPS, TRANSLATION_ACADEMY, 'v9', 'translate', 'translate-names.md');
    expect(filePath).toEqual(expectedPath);
  });

  it('findArticleFilePath for tW abraham but giving a wrong category should return null', () => {
    loadMockFsWithProjectAndResources();
    const filePath = findArticleFilePath(TRANSLATION_WORDS, 'abraham', 'en', 'kt');
    expect(filePath).toBeNull();
  });
});


describe('loadArticleData()', () => {
  it('loadArticleData for tW abraham giving correct category', () => {
    loadMockFsWithProjectAndResources();
    const articleId = 'abraham';
    const category = 'names';
    const content = loadArticleData(TRANSLATION_WORDS, articleId, 'en', category);
    const notExpectedContent = '# Article Not Found: '+articleId+' #\n\nCould not find article for '+articleId;
    expect(content).toBeTruthy();
    expect(content).not.toEqual(notExpectedContent);
  });

  it('loadArticeData for tW abraham but giving a wrong category should return not found message', () => {
    loadMockFsWithProjectAndResources();
    const articleId = 'abraham';
    const category = 'kt';
    const content = loadArticleData(TRANSLATION_WORDS, articleId, 'en', category);
    const expectedContent = '# Article Not Found: '+articleId+' #\n\nCould not find article for '+articleId;
    expect(content).toEqual(expectedContent);
  });

  it('loadArticleData for tW abraham with no category', () => {
    loadMockFsWithProjectAndResources();
    const articleId = 'abraham';
    const content = loadArticleData(TRANSLATION_WORDS, articleId, 'en');
    const notExpectedContent = '# Article Not Found: '+articleId+' #\n\nCould not find article for '+articleId;
    expect(content).toBeTruthy();
    expect(content).not.toEqual(notExpectedContent);
  });

  it('loadArticleData for tA translate-names with no category and hindi should still find (English) content', () => {
    loadMockFsWithProjectAndResources();
    const articleId = 'translate-names';
    const content = loadArticleData(TRANSLATION_ACADEMY, articleId, 'hi');
    const notExpectedContent = '# Article Not Found: '+articleId+' #\n\nCould not find article for '+articleId;
    expect(content).toBeTruthy();
    expect(content).not.toEqual(notExpectedContent);
  });
});

describe('updateGroupIndexForGl()', () => {
  const bookId = 'gal';
  const manifest_ = {
    'generator':{ 'name':'tc-desktop','build':'' },
    'target_language':{
      'id':'en','name':'English','direction':'ltr',
    },
    'ts_project':{ 'id':bookId,'name':'Galatians' },
    'project':{ 'id':bookId,'name':'Galatians' },
    'type':{ 'id':'text','name':'Text' },
    'time_created':'2018-01-31T19:19:27.914Z',
    'tcInitialized':true,
    'tc_version':1,
    'license':'CC BY-SA 4.0',
  };
  const contextId = {
    groupId: 'figs-explicit',
    occurrence: 1,
    reference: {
      'bookId': bookId,
      'chapter': 3,
      'verse': 5,
    },
  };
  const projectName = 'en_gal';
  const projectPath = path.join(PROJECTS_PATH, projectName);
  const tnIndexPath = path.join(projectPath, '.apps', 'translationCore', 'index', TRANSLATION_NOTES, bookId);

  beforeEach(() => {
    // reset mock filesystem data
    fs.__resetMockFS();
    loadMockFsWithProjectAndResources();
    const sourceResourcesPath = path.join('src', '__tests__', 'fixtures', 'resources');
    const copyResourceFiles = ['en/translationHelps/translationNotes'];
    fs.__loadFilesIntoMockFs(copyResourceFiles, sourceResourcesPath, USER_RESOURCES_PATH);
    const sourcePath = path.join('src', '__tests__/fixtures/project');
    let copyFiles = [projectName];
    fs.__loadFilesIntoMockFs(copyFiles, sourcePath, PROJECTS_PATH);
    fs.__loadFilesIntoMockFs(['source-content-updater-manifest.json'], STATIC_RESOURCES_PATH, USER_RESOURCES_PATH);
  });

  it('should succeed', () => {
    // given
    const toolName = TRANSLATION_NOTES;
    const contextId_ = _.cloneDeep(contextId);
    contextId_.tool = toolName;
    const store = mockStore({
      resourcesReducer: {
        bibles: { targetLanguage: { targetBible: { manifest: {} } } },
        translationHelps: {},
        lexicons: {},
      },
      contextIdReducer: { contextId: {} },
      settingsReducer: {
        toolsSettings: {
          ScripturePane: {
            currentPaneSettings: [
              {
                bibleId: TARGET_BIBLE,
                languageId: TARGET_LANGUAGE,
              }, {
                bibleId: 'ugnt',
                languageId: ORIGINAL_LANGUAGE,
              }, {
                bibleId: 'ust',
                languageId: 'en',
              }, {
                bibleId: 'ult',
                languageId: 'en',
              },
            ],
          },
        },
      },
      projectDetailsReducer: {
        manifest: manifest_,
        projectSaveLocation: projectPath,
      },
    });
    const loadPath = getContextIdPathFromIndex(projectPath, toolName, bookId);
    fs.outputJsonSync(loadPath, contextId_);

    // when
    store.dispatch(updateGroupIndexForGl(toolName, 'en'));

    // then
    const storedContextId = fs.readJsonSync(loadPath);
    expect(storedContextId).toMatchSnapshot();
    expect(fs.existsSync(path.join(tnIndexPath, contextId.groupId + '.json'))).toBeTruthy(); // should have copied resources
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
    resource_.manifest = 'manifest';
    newResourceList.push(resource_);
  }
  return newResourceList;
}

function loadMockFsWithProjectAndResources() {
  const sourcePath = path.join('src', '__tests__', 'fixtures', 'project');
  const copyFiles = ['en_gal'];
  fs.__loadFilesIntoMockFs(copyFiles, sourcePath, PROJECTS_PATH);

  const sourceResourcesPath = path.join('src', '__tests__', 'fixtures', 'resources');
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

function loadSourceContentUpdaterManifests(bundledDate, userDate, appVersion = APP_VERSION) {
  const bundledResourcesManifestPath = path.join(STATIC_RESOURCES_PATH, 'source-content-updater-manifest.json');
  fs.ensureDirSync(STATIC_RESOURCES_PATH);

  if (bundledDate) {
    fs.outputJsonSync(bundledResourcesManifestPath, { modified: bundledDate });
  }

  const resourcesManifestPath = path.join(USER_RESOURCES_PATH, 'source-content-updater-manifest.json');
  fs.ensureDirSync(USER_RESOURCES_PATH);

  if (userDate) {
    const manifest = { modified: userDate };

    if (typeof appVersion === 'string') {
      manifest[TC_VERSION] = appVersion; // add app version to resource
    }
    fs.outputJsonSync(resourcesManifestPath, manifest);
  }
}
