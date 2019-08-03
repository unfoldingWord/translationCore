import fs from 'fs-extra';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import path from 'path-extra';
// actions
import { generateTimestamp } from '../src/js/helpers';
import * as GroupsDataActions from '../src/js/actions/GroupsDataActions';
import * as saveMethods from '../src/js/localStorage/saveMethods';
import {delay} from "../src/js/common/utils";
// constants
const FIXTURES_CHECKDATA_PATH = path.join(__dirname, 'fixtures', 'checkData');
const CURRENT_PROJECT_PATH = path.join(__dirname, 'fixtures', 'project', 'en_tit');
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
import { WORD_ALIGNMENT, TRANSLATION_WORDS } from '../src/js/common/constants';

jest.mock('redux-batched-actions', () => ({
  batchActions: (actionsBatch) => {
    return (dispatch) => {
      if (actionsBatch.length) {
        for (let action of actionsBatch) {
          dispatch(action);
        }
      }
    };
  }
}));

describe('GroupsDataActions.verifyGroupDataMatchesWithFs', () => {
  let saveOtherContextSpy = null;

  beforeEach(() => {
    saveOtherContextSpy = jest.spyOn(saveMethods,
      'saveSelectionsForOtherContext');
    fs.__resetMockFS();
    fs.__loadDirIntoMockFs(FIXTURES_CHECKDATA_PATH, FIXTURES_CHECKDATA_PATH);
    fs.__loadDirIntoMockFs(CURRENT_PROJECT_PATH, CURRENT_PROJECT_PATH);
  });

  afterEach(() => {
    removeSpy(saveOtherContextSpy);
  });

  it('should succeed without external verse edits', async () => {
    // given
    const bookId = 'tit';
    const groupsDataReducer = fs.readJsonSync(path.join(FIXTURES_CHECKDATA_PATH, 'en_tit', 'groupsDataReducer.json'));
    const initStore = {
      groupsDataReducer,
      toolsReducer: {
        selectedTool: TRANSLATION_WORDS
      },
      projectDetailsReducer: {
        manifest: {
          project: {
            id: bookId
          }
        },
        projectSaveLocation: CURRENT_PROJECT_PATH
      }
    };
    const store = mockStore(initStore);

    // when
    await store.dispatch(GroupsDataActions.verifyGroupDataMatchesWithFs(initStore.toolsReducer.selectedTool));

    // then
    const actions = store.getActions();
    expect(cleanOutDates(actions)).toMatchSnapshot();
  });

  it('should succeed with external verse edits', async () => {
    // given
    const bookId = 'tit';
    const groupsDataReducer = fs.readJsonSync(path.join(FIXTURES_CHECKDATA_PATH, 'en_tit', 'groupsDataReducer.json'));
    const initStore = {
      groupsDataReducer,
      toolsReducer: {
        selectedTool: TRANSLATION_WORDS
      },
      projectDetailsReducer: {
        manifest: {
          project: {
            id: bookId
          }
        },
        projectSaveLocation: CURRENT_PROJECT_PATH
      }
    };
    const store = mockStore(initStore);
    // add verse edit
    const verseEdit = {"verseBefore":"To Titus, a true son in our common faith. Grace and peace from God the Father and Christ Jesus our savior.\n\\p","verseAfter":"To Titus, a true son in our common faith. Grace and peace from God the Father and Christ Jesus our savior.\n\\p Edit 1:4","tags":["other"],"userName":"photonomad1","activeBook":"tit","activeChapter":1,"activeVerse":1,"modifiedTimestamp":"2019-05-16T12:11:45.970Z","gatewayLanguageCode":"en","gatewayLanguageQuote":"","contextId":{"reference":{"bookId":"tit","chapter":1,"verse":4},"tool":WORD_ALIGNMENT,"groupId":"chapter_1"}};
    const verseEditPath = path.join(CURRENT_PROJECT_PATH, ".apps/translationCore/checkData", "verseEdits", bookId, "1", "4");
    fs.ensureDirSync(verseEditPath);
    const fileName = generateTimestamp() + ".json";
    fs.outputJsonSync(path.join(verseEditPath, fileName), verseEdit);

    // when
    store.dispatch(GroupsDataActions.verifyGroupDataMatchesWithFs(initStore.toolsReducer.selectedTool));
    await delay(1000);

    // then
    const actions = store.getActions();
    expect(cleanOutDates(actions)).toMatchSnapshot();
  });

  it('should succeed with multiple external verse edits', async () => {
    // given
    const bookId = 'tit';
    const groupsDataReducer = fs.readJsonSync(path.join(FIXTURES_CHECKDATA_PATH, 'en_tit', 'groupsDataReducer.json'));
    const initStore = {
      groupsDataReducer,
      toolsReducer: {
        selectedTool: TRANSLATION_WORDS
      },
      projectDetailsReducer: {
        manifest: {
          project: {
            id: bookId
          }
        },
        projectSaveLocation: CURRENT_PROJECT_PATH
      }
    };
    const store = mockStore(initStore);
    // add verse edit
    let verseEdit = {"verseBefore":"To Titus, a true son in our common faith. Grace and peace from God the Father and Christ Jesus our savior.\n\\p","verseAfter":"To Titus, a true son in our common faith. Grace and peace from God the Father and Christ Jesus our savior.\n\\p Edit 1:4","tags":["other"],"userName":"photonomad1","activeBook":"tit","activeChapter":1,"activeVerse":1,"modifiedTimestamp":"2019-05-16T12:11:45.970Z","gatewayLanguageCode":"en","gatewayLanguageQuote":"","contextId":{"reference":{"bookId":"tit","chapter":1,"verse":4},"tool":WORD_ALIGNMENT,"groupId":"chapter_1"}};
    let verseEditPath = path.join(CURRENT_PROJECT_PATH, ".apps/translationCore/checkData", "verseEdits", bookId, "1", "4");
    fs.ensureDirSync(verseEditPath);
    let fileName = generateTimestamp() + ".json";
    fs.outputJsonSync(path.join(verseEditPath, fileName), verseEdit);

    // add 2nd verse edit
    verseEdit = {"verseBefore":"To Titus, a true son in our common faith. Grace and peace from God the Father and Christ Jesus our savior.\n\\p","verseAfter":"To Titus, a true son in our common faith. Grace and peace from God the Father and Christ Jesus our savior.\n\\p Edit 1:7","tags":["other"],"userName":"photonomad1","activeBook":"tit","activeChapter":1,"activeVerse":7,"modifiedTimestamp":"2019-05-16T12:11:45.970Z","gatewayLanguageCode":"en","gatewayLanguageQuote":"","contextId":{"reference":{"bookId":"tit","chapter":1,"verse":7},"tool":WORD_ALIGNMENT,"groupId":"chapter_1"}};
    verseEditPath = path.join(CURRENT_PROJECT_PATH, ".apps/translationCore/checkData", "verseEdits", bookId, "1", "7");
    fs.ensureDirSync(verseEditPath);
    fileName = generateTimestamp() + ".json";
    fs.outputJsonSync(path.join(verseEditPath, fileName), verseEdit);

    // when
    store.dispatch(GroupsDataActions.verifyGroupDataMatchesWithFs(initStore.toolsReducer.selectedTool));
    await delay(1000);

    // then
    const actions = store.getActions();
    expect(cleanOutDates(actions)).toMatchSnapshot();
  });
});

describe('GroupsDataActions.validateBookSelections', () => {
  const bookId = 'tit';
  const selectionsReducer = {
    gatewayLanguageCode: 'en',
    gatewayLanguageQuote: 'authority, authorities',
    'selections': [
      {
        'text': 'apostle',
        'occurrence': 1,
        'occurrences': 1
      }
    ],
    username: 'dummy-test',
    modifiedTimestamp: generateTimestamp()
  };
  let saveOtherContextSpy = null;

  beforeEach(() => {
    saveOtherContextSpy = jest.spyOn(saveMethods,
      'saveSelectionsForOtherContext');
    fs.__resetMockFS();
    fs.__loadDirIntoMockFs(FIXTURES_CHECKDATA_PATH, FIXTURES_CHECKDATA_PATH);
    fs.__loadDirIntoMockFs(CURRENT_PROJECT_PATH, CURRENT_PROJECT_PATH);
  });

  afterEach(() => {
    removeSpy(saveOtherContextSpy);
  });

  it('No selection changes', () => {
    // given
    const store = initiMockStore(bookId, selectionsReducer);
    const expectedSelectionChanges = 0;

    // when
    store.dispatch(GroupsDataActions.validateBookSelections());

    // then
    const actions = store.getActions();
    expect(cleanOutDates(actions)).toMatchSnapshot();
    expect(saveOtherContextSpy).toHaveBeenCalledTimes(expectedSelectionChanges);
  });

  it('apostle selection edited', () => {
    // given
    const targetVerse = 'Paul, a servant of God and an apostl2 of Jesus Christ, for the faith of God\'s chosen people and the knowledge of the truth that agrees with godliness, ';
    const store = initiMockStore(bookId, selectionsReducer, '1', '1',
      targetVerse);
    const expectedSelectionChanges = 1;

    // when
    store.dispatch(GroupsDataActions.validateBookSelections());

    // then
    const actions = store.getActions();
    expect(cleanOutDates(actions)).toMatchSnapshot();
    expect(saveOtherContextSpy).toHaveBeenCalledTimes(expectedSelectionChanges);
  });

  it('all selections edited', () => {
    // given
    const targetVerse = '';
    const store = initiMockStore(bookId, selectionsReducer, '1', '1',
      targetVerse);
    const expectedSelectionChanges = 2;

    // when
    store.dispatch(GroupsDataActions.validateBookSelections());

    // then
    const actions = store.getActions();
    expect(cleanOutDates(actions)).toMatchSnapshot();
    expect(saveOtherContextSpy).toHaveBeenCalledTimes(expectedSelectionChanges);
  });
});

//
// helpers
//

function cleanOutDates (actions) {
  const cleanedActions = JSON.parse(JSON.stringify(actions));
  for (let action of cleanedActions) {
    if (action.modifiedTimestamp) {
      delete action.modifiedTimestamp;
    }
  }
  return cleanedActions;
}

function getInitialStateData (bookId, checkPath, projectPath) {
  const contextId = {
    reference: {
      bookId: bookId,
      chapter: 1,
      verse: 1
    },
    groupId: ''
  };
  const groupsDataReducer = fs.readJSONSync(
    path.join(checkPath, 'groupsDataReducer.json'));
  const groupsIndexReducer = fs.readJSONSync(
    path.join(checkPath, 'groupsIndexReducer.json'));
  const targetBible = {
    1: fs.readJSONSync(path.join(projectPath, '1.json')),
    2: fs.readJSONSync(path.join(projectPath, '2.json')),
    3: fs.readJSONSync(path.join(projectPath, '3.json'))
  };

  const initialState = {
    actions: {},
    groupsDataReducer,
    groupsIndexReducer,
    projectInformationCheckReducer: {
      bookId
    },
    resourcesReducer: {bibles: {targetLanguage: {targetBible}}},
    toolsReducer: {
      selectedTool: TRANSLATION_WORDS
    },
    loginReducer: {
      loggedInUser: false,
      userdata: {
        username: 'dummy-test'
      }
    },
    projectDetailsReducer: {
      manifest: {
        project: {
          id: bookId
        }
      },
      projectSaveLocation: path.resolve(checkPath),
      currentProjectToolsSelectedGL: {
        translationWords: 'en'
      },
      currentToolName: TRANSLATION_WORDS
    },
    contextIdReducer: {
      contextId
    }
  };
  return initialState;
}

function removeSpy (spy) {
  if (spy) {
    spy.mockReset();
    spy.mockRestore();
  }
}

function initiMockStore (bookId, selectionsReducer, chapter = null, verse = null, targetVerse = null) {
  const checkPath = path.join(FIXTURES_CHECKDATA_PATH, 'en_tit');
  const projectPath = path.join(CURRENT_PROJECT_PATH, 'tit');
  const initialState = getInitialStateData(bookId, checkPath, projectPath);
  initialState.selectionsReducer = selectionsReducer;
  initialState.projectDetailsReducer = {
    ...initialState.projectDetailsReducer,
    projectSaveLocation: CURRENT_PROJECT_PATH,
    manifest: {project: {id: bookId}}
  };

  if (typeof targetVerse === 'string') {
    const bibleChapter = initialState.resourcesReducer.bibles.targetLanguage.targetBible[chapter];
    bibleChapter[verse] = targetVerse;
  }
  return mockStore(initialState);
}

