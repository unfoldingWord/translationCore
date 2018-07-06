import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import path from 'path-extra';
import ospath from 'ospath';
import fs from "fs-extra";
// actions
import * as ResourcesActions from '../src/js/actions/ResourcesActions';
// constants
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
const PROJECTS_PATH = path.join(ospath.home(), 'translationCore', 'projects');
const RESOURCE_PATH = path.join(ospath.home(), 'translationCore', 'resources');

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
      "morph": "Gr,N,,,,,NMS,",
      "tw": "rc://*/tw/dict/bible/names/paul"
    };
    const expectedFirstTopWord = {
      "word": "Παῦλος",
      "occurrence": 1,
      "occurrences": 1,
      "lemma": "Παῦλος",
      "strong": "G39720",
      "morph": "Gr,N,,,,,NMS,"
    };
    const expectedResources = ['en', 'originalLanguage', 'targetLanguage'];

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
          originalLanguage: {
            ugnt
          },
          targetLanguage: {
            targetBible: {
              1: {}
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
    validateExpectedResources(actions, "ADD_NEW_BIBLE_TO_RESOURCES", "languageId", expectedResources);

    // make sure UGNT loaded and has expected format
    let ugntAction = getAction(actions, "ADD_NEW_BIBLE_TO_RESOURCES", 'languageId', 'originalLanguage', 'bibleId', 'ugnt');
    expect(ugntAction).not.toBeNull();
    let firstChapter = ugntAction.bibleData[1];
    let firstVerse = firstChapter[1];
    if (firstVerse.verseObjects) {
      firstVerse = firstVerse.verseObjects;
    }
    let firstWord = firstVerse.find(object => (object.type === 'word'));
    expect(firstWord).toEqual(expectedFirstWord);

    // make sure alignment used UGNT data
    // let alignmentAction = getAction(actions, "UPDATE_ALIGNMENT_DATA");
    // expect(alignmentAction.alignmentData).not.toBeNull();
    // firstChapter = alignmentAction.alignmentData[1];
    // firstVerse = firstChapter[1];
    // let firstAlignment = firstVerse.alignments[0];
    // firstWord = firstAlignment.topWords[0];
    // expect(firstWord).toEqual(expectedFirstTopWord);
  });

  it('findArticleFilePath for abel in en', () => {
    loadMockFsWithProjectAndResources();
    const filePath = ResourcesActions.findArticleFilePath('translationWords', 'abel', 'en');
    const expectedPath = path.join(RESOURCE_PATH, 'en', 'translationHelps', 'translationWords', 'v8', 'names', 'articles', 'abel.md');
    expect(filePath).toEqual(expectedPath);
  });

  it('findArticleFilePath for a non-existing file', () => {
    loadMockFsWithProjectAndResources();
    const filePath = ResourcesActions.findArticleFilePath('translationWords', 'does-not-exist', 'en');
    expect(filePath).toBeNull();
  });

  it('findArticleFilePath for abraham which is not in Hindi, but search hindi first', () => {
    loadMockFsWithProjectAndResources();
    const filePath = ResourcesActions.findArticleFilePath('translationWords', 'abomination', 'hi');
    const expectedPath = path.join(RESOURCE_PATH, 'hi', 'translationHelps', 'translationWords', 'v8.1', 'kt', 'articles', 'abomination.md');
    expect(filePath).toEqual(expectedPath);
  });

  it('findArticleFilePath for abraham which is not in Hindi, but search hindi first', () => {
    loadMockFsWithProjectAndResources();
    const filePath = ResourcesActions.findArticleFilePath('translationWords', 'abraham', 'hi');
    const expectedPath = path.join(RESOURCE_PATH, 'en', 'translationHelps', 'translationWords', 'v8', 'names', 'articles', 'abraham.md');
    expect(filePath).toEqual(expectedPath);
  });

  it('findArticleFilePath for tA translate-names which is not in Hindi so should return English', () => {
    loadMockFsWithProjectAndResources();
    const filePath = ResourcesActions.findArticleFilePath('translationAcademy', 'translate-names', 'hi');
    const expectedPath = path.join(RESOURCE_PATH, 'en', 'translationHelps', 'translationAcademy', 'v9', 'translate', 'translate-names.md');
    expect(filePath).toEqual(expectedPath);
  });

  it('findArticleFilePath for tW abraham but giving a wrong category should return null', () => {
    loadMockFsWithProjectAndResources();
    const filePath = ResourcesActions.findArticleFilePath('translationWords', 'abraham', 'en', 'kt');
    expect(filePath).toBeNull();
  });

  it('loadResourceArticle for tW abraham giving correct category', () => {
    loadMockFsWithProjectAndResources();
    const articleId = 'abraham';
    const category = 'names';
    const content = ResourcesActions.loadArticleData('translationWords', articleId, 'en', category);
    const notExpectedContent = '# Article Not Found: '+articleId+' #\n\nCould not find article for '+articleId;
    expect(content).toBeTruthy();
    expect(content).not.toEqual(notExpectedContent);
  });

  it('loadArticeData for tW abraham but giving a wrong category should return not found message', () => {
    loadMockFsWithProjectAndResources();
    const articleId = 'abraham';
    const category = 'kt';
    const content = ResourcesActions.loadArticleData('translationWords', articleId, 'en', category);
    const expectedContent = '# Article Not Found: '+articleId+' #\n\nCould not find article for '+articleId;
    expect(content).toEqual(expectedContent);
  });

  it('loadResourceArticle for tW abraham with no category', () => {
    loadMockFsWithProjectAndResources();
    const articleId = 'abraham';
    const content = ResourcesActions.loadArticleData('translationWords', articleId, 'en');
    const notExpectedContent = '# Article Not Found: '+articleId+' #\n\nCould not find article for '+articleId;
    expect(content).toBeTruthy();
    expect(content).not.toEqual(notExpectedContent);
  });

  it('loadResourceArticle for tA translate-names with no category and hindi should still find (English) content', () => {
    loadMockFsWithProjectAndResources();
    const articleId = 'translate-names';
    const content = ResourcesActions.loadArticleData('translationAcademy', articleId, 'hi');
    const notExpectedContent = '# Article Not Found: '+articleId+' #\n\nCould not find article for '+articleId;
    expect(content).toBeTruthy();
    expect(content).not.toEqual(notExpectedContent);
  });

  it('loads a book resource', () => {
    const bookId = 'gal';
    const expectedFirstWord = {
      "text": "Παῦλος",
      "tag": "w",
      "type": "word",
      "lemma": "Παῦλος",
      "strong": "G39720",
      "morph": "Gr,N,,,,,NMS,",
      "tw": "rc://*/tw/dict/bible/names/paul"
    };

    const expectedResources = ['en', 'originalLanguage', 'targetLanguage'];

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
          originalLanguage: {
            ugnt
          },
          targetLanguage: {
            targetBible: {
              1: {}
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
      ResourcesActions.loadBooks(contextId)
    );

    // then
    const state = store.getState();
    expect(state).not.toBeNull();

    const actions = store.getActions();
    validateExpectedResources(actions, "ADD_NEW_BIBLE_TO_RESOURCES", "languageId", expectedResources);

    // make sure more than one chapter was loaded
    for(const a of actions) {
      expect(Object.keys(a.bibleData).length > 1).toBeTruthy();
    }

    // make sure UGNT loaded and has expected format
    let ugntAction = getAction(actions, "ADD_NEW_BIBLE_TO_RESOURCES", 'languageId', 'originalLanguage', 'bibleId', 'ugnt');
    expect(ugntAction).not.toBeNull();
    let firstChapter = ugntAction.bibleData[1];
    let firstVerse = firstChapter[1];
    if (firstVerse.verseObjects) {
      firstVerse = firstVerse.verseObjects;
    }
    let firstWord = firstVerse.find(object => (object.type === 'word'));
    expect(firstWord).toEqual(expectedFirstWord);
  });
});

//
// helpers
//

function getAction(actions, type, key, value, key2, value2) {
  for (let action of actions) {
    if (action.type === type) {
      if (!key || (action[key] === value) || (action[key] === value && action[key2] === value2)) {
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
  const sourcePath = path.join('__tests__', 'fixtures', 'project');
  const copyFiles = ['en_gal'];
  fs.__loadFilesIntoMockFs(copyFiles, sourcePath, PROJECTS_PATH);

  const sourceResourcesPath = path.join('__tests__', 'fixtures', 'resources');
  const resourcesPath = RESOURCE_PATH;
  const copyResourceFiles = [
    'en/bibles/ult/v11/index.json', 'en/bibles/ult/v11/manifest.json', 'en/bibles/ult/v11/gal',
    'en/bibles/udt/v10/index.json', 'en/bibles/udt/v10/manifest.json', 'en/bibles/udt/v10/gal',
    'grc/bibles/ugnt/v0/index.json', 'grc/bibles/ugnt/v0/manifest.json', 'grc/bibles/ugnt/v0/gal',
    'en/translationHelps/translationWords/v8', 'en/translationHelps/translationAcademy/v9',
    'hi/translationHelps/translationWords/v8.1'];
  fs.__loadFilesIntoMockFs(copyResourceFiles, sourceResourcesPath, resourcesPath);
}
