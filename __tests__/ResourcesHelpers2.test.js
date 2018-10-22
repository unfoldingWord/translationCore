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
  it('getAvailableScripturePaneSelections() should work', () => {
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
    loadMockFsWithProjectAndResources();
    const resourceList = [];

    // when
    store.dispatch(
      ResourcesHelpers.getAvailableScripturePaneSelections(resourceList)
    );

    // then
    expect(cleanupResources(resourceList)).toMatchSnapshot();
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
    'en/translationHelps/translationWords',
    'en/translationHelps/translationAcademy',
    'hi/translationHelps/translationWords'];
  fs.__loadFilesIntoMockFs(copyResourceFiles, sourceResourcesPath, resourcesPath);
}

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
