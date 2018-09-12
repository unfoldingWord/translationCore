/* eslint-env jest */
import path from 'path';

// helpers
import * as ResourcesHelpers from '../src/js/helpers/ResourcesHelpers';
import ospath from "ospath";
import fs from "fs-extra";

const PROJECTS_PATH = path.join(ospath.home(), 'translationCore', 'projects');
const RESOURCE_PATH = path.join(ospath.home(), 'translationCore', 'resources');

describe('ResourcesHelpers.getAvailableScripturePaneSelections', () => {
  it('getAvailableScripturePaneSelections() should work', () => {
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

//
// helpers
//

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
