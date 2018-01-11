import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as ResourcesActions from '../src/js/actions/ResourcesActions';
import path from 'path-extra';
import fs from "fs-extra";

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
const PROJECTS_PATH = path.join(path.homedir(), 'translationCore', 'projects');
const RESOURCE_PATH = path.join(path.homedir(), 'translationCore', 'resources');

describe('ResourcesActions', () => {
  beforeEach(() => {
    // reset mock filesystem data
    fs.__resetMockFS();
    fs.__setMockFS({}); // initialize to empty
  });
  afterEach(() => {
    // reset mock filesystem data
    fs.__resetMockFS();
  });
  // given
  it('loadBiblesChapter() gal', () => {
    const bookId = 'gal';
    const expectedFirstWord = {
      "text": "Παῦλος",
      "tag": "w",
      "type": "word",
      "lemma": "Παῦλος",
      "strong": "G39720",
      "strongs": "G39720",
      "morph": "Gr,N,,,,,NMS,",
      "tw": "rc://*/tw/dict/bible/names/paul"
    };
    const expectedFirstTopWord = {
      "word": "Παῦλος",
      "occurrence": 1,
      "occurrences": 1,
      "lemma": "Παῦλος",
      "strongs": "G39720",
      "morph": "Gr,N,,,,,NMS,"
    };
    const expectedResources = ['udb', 'ulb', 'ugnt', 'targetLanguage'];

    const projectPath = path.join(PROJECTS_PATH, "en_gal");
    loadMockFsWithProjectAndResources();

    const ugnt = require("./fixtures/project/en_gal/bibleData.json");

    const store = mockStore({
      actions: {},
      wordAlignmentReducer: {
        alignmentData: {
          ugnt: { }
        }
      },
      toolsReducer: {
        currentToolName: 'wordAlignment'
      },
      projectDetailsReducer: {
        manifest: {
          project: {
            id: bookId
          }
        },
        projectSaveLocation: path.resolve(projectPath)
      },
      resourcesReducer: {
        bibles: {
          ugnt: ugnt,
          targetLanguage: {
            1: {}
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
      }
    });
    const contextId = {
      reference: {
        bookId: bookId,
        chapter: 1
      }
    };

    // when
    store.dispatch(
      ResourcesActions.loadBiblesChapter(contextId)
    );

    // then
    const state = store.getState();
    expect(state).not.toBeNull();

    const actions = store.getActions();
    console.log("Actions: " + actions.length);
    validateExpectedResources(actions, "ADD_NEW_BIBLE_TO_RESOURCES", "bibleName", expectedResources);

    // make sure UGNT loaded and has expected format
    let ugntAction = getAction(actions, "ADD_NEW_BIBLE_TO_RESOURCES", "bibleName", "ugnt");
    expect(ugntAction).not.toBeNull();
    let firstCh = ugntAction.bibleData[1];
    let firstVs = firstCh[1];
    let firstWd = firstVs[0];
    expect(firstWd).toEqual(expectedFirstWord);

    // make sure alignment used UGNT data
    let alignmentAction = getAction(actions, "UPDATE_ALIGNMENT_DATA");
    expect(alignmentAction.alignmentData).not.toBeNull();
    firstCh = alignmentAction.alignmentData[1];
    firstVs = firstCh[1];
    let firstAlignment = firstVs.alignments[0];
    firstWd = firstAlignment.topWords[0];
    expect(firstWd).toEqual(expectedFirstTopWord);
  });
});

//
// helpers
//

function getAction(actions, type, key, value) {
  for (let action of actions) {
    if (action.type === type) {
      if (!key || (action[key] === value)) {
        return action;
      }
    }
  }
  return null;
}

function validateExpectedResources(actions, type, key, expectedValues) {
  expect(actions).not.toBeNull();
  for (let expectedValue of expectedValues) {
    let found = getAction(actions, type, key, expectedValue);
    expect(found).not.toBeNull();
  }
}

function loadMockFsWithProjectAndResources() {
  const sourcePath = "__tests__/fixtures/project/";
  const copyFiles = ['en_gal'];
  fs.__loadFilesIntoMockFs(copyFiles, sourcePath, PROJECTS_PATH);

  const sourceResourcesPath = "__tests__/fixtures/resources/";
  const resourcesPath = RESOURCE_PATH;
  const copyResourceFiles = [
    'en/bibles/ulb/v11/index.json', 'en/bibles/ulb/v11/manifest.json', 'en/bibles/ulb/v11/gal',
    'en/bibles/udb/v10/index.json', 'en/bibles/udb/v10/manifest.json', 'en/bibles/udb/v10/gal',
    'grc/bibles/ugnt/v0/index.json', 'grc/bibles/ugnt/v0/manifest.json', 'grc/bibles/ugnt/v0/gal'];
  fs.__loadFilesIntoMockFs(copyResourceFiles, sourceResourcesPath, resourcesPath);
}
