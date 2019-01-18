/* eslint-env jest */
jest.mock('fs-extra');
jest.mock('adm-zip');
import path from 'path';
import ospath from "ospath";
import fs from "fs-extra";
import thunk from "redux-thunk";
import configureMockStore from "redux-mock-store";
import _ from "lodash";
// helpers
import * as ResourcesHelpers from '../src/js/helpers/ResourcesHelpers';
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
    beforeAll(() => {
      fs.__resetMockFS();
      loadMockFsWithlexicons();
      fs.ensureDirSync(path.join(RESOURCE_PATH, 'en'));
    });

    beforeEach(() => {
      const lexiconsPath = 'en/lexicons';
      const lexiconResourcePath = path.join(RESOURCE_PATH, lexiconsPath);
      fs.removeSync(lexiconResourcePath);
    });

    it('should copy missing uhl and ugl lexicons', () => {
      const lexiconsPath = 'en/lexicons';
      const expectedLexicons = ['ugl', 'uhl'];
      const lexiconResourcePath = path.join(RESOURCE_PATH, lexiconsPath);

      // when
      ResourcesHelpers.getMissingResources();

      // then
      verifyLexicons(expectedLexicons, lexiconResourcePath);
    });

    it('should copy missing uhl lexicon', () => {
      const lexiconsPath = 'en/lexicons';
      const expectedLexicons = ['ugl', 'uhl'];
      const lexiconResourcePath = path.join(RESOURCE_PATH, lexiconsPath);
      fs.ensureDirSync(path.join(lexiconResourcePath, 'ugl'));

      // when
      ResourcesHelpers.getMissingResources();

      // then
      verifyLexicons(expectedLexicons, lexiconResourcePath);
    });

    it('should work with no missing lexicons', () => {
      const lexiconsPath = 'en/lexicons';
      const expectedLexicons = ['ugl', 'uhl'];
      const lexiconResourcePath = path.join(RESOURCE_PATH, lexiconsPath);
      fs.ensureDirSync(path.join(lexiconResourcePath, 'ugl'));
      fs.ensureDirSync(path.join(lexiconResourcePath, 'uhl'));

      // when
      ResourcesHelpers.getMissingResources();

      // then
      verifyLexicons(expectedLexicons, lexiconResourcePath);
    });
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

function verifyLexicons(expectedLexicons, lexiconResourcePath) {
  for (let lexicon of expectedLexicons) {
    const folderPath = path.join(lexiconResourcePath, lexicon);
    const folderExists = fs.lstatSync(folderPath).isDirectory();
    expect(folderExists).toBeTruthy();
  }
}
