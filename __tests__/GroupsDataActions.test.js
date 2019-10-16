/* eslint-disable object-curly-newline */
import fs from 'fs-extra';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import path from 'path-extra';
// actions
import { generateTimestamp } from '../src/js/helpers';
import * as GroupsDataActions from '../src/js/actions/GroupsDataActions';
import * as saveMethods from '../src/js/localStorage/saveMethods';
import { WORD_ALIGNMENT, TRANSLATION_WORDS } from '../src/js/common/constants';
// constants
const FIXTURES_CHECKDATA_PATH = path.join(__dirname, 'fixtures', 'checkData');
const CURRENT_PROJECT_PATH = path.join(__dirname, 'fixtures', 'project', 'en_tit');
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('redux-batched-actions', () => ({
  batchActions: (actionsBatch) => (dispatch) => {
    if (actionsBatch.length) {
      for (let action of actionsBatch) {
        dispatch(action);
      }
    }
  },
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
      toolsReducer: { selectedTool: TRANSLATION_WORDS },
      projectDetailsReducer: {
        manifest: { project: { id: bookId } },
        projectSaveLocation: CURRENT_PROJECT_PATH,
      },
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
      toolsReducer: { selectedTool: TRANSLATION_WORDS },
      projectDetailsReducer: {
        manifest: { project: { id: bookId } },
        projectSaveLocation: CURRENT_PROJECT_PATH,
      },
    };
    const store = mockStore(initStore);
    // add verse edit
    const verseEdit = {
      'verseBefore':'To Titus, a true son in our common faith. Grace and peace from God the Father and Christ Jesus our savior.\n\\p','verseAfter':'To Titus, a true son in our common faith. Grace and peace from God the Father and Christ Jesus our savior.\n\\p Edit 1:4','tags':['other'],'userName':'photonomad1','activeBook':'tit','activeChapter':1,'activeVerse':1,'modifiedTimestamp':'2019-05-16T12:11:45.970Z','gatewayLanguageCode':'en','gatewayLanguageQuote':'','contextId':{
        'reference':{
          'bookId':'tit','chapter':1,'verse':4,
        },'tool':WORD_ALIGNMENT,'groupId':'chapter_1',
      },
    };
    const verseEditPath = path.join(CURRENT_PROJECT_PATH, '.apps/translationCore/checkData', 'verseEdits', bookId, '1', '4');
    fs.ensureDirSync(verseEditPath);
    const fileName = generateTimestamp() + '.json';
    fs.outputJsonSync(path.join(verseEditPath, fileName), verseEdit);

    // when
    await store.dispatch(GroupsDataActions.verifyGroupDataMatchesWithFs(initStore.toolsReducer.selectedTool));

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
      toolsReducer: { selectedTool: TRANSLATION_WORDS },
      projectDetailsReducer: {
        manifest: { project: { id: bookId } },
        projectSaveLocation: CURRENT_PROJECT_PATH,
      },
    };
    const store = mockStore(initStore);
    // add verse edit
    let verseEdit = {
      'verseBefore':'To Titus, a true son in our common faith. Grace and peace from God the Father and Christ Jesus our savior.\n\\p','verseAfter':'To Titus, a true son in our common faith. Grace and peace from God the Father and Christ Jesus our savior.\n\\p Edit 1:4','tags':['other'],'userName':'photonomad1','activeBook':'tit','activeChapter':1,'activeVerse':1,'modifiedTimestamp':'2019-05-16T12:11:45.970Z','gatewayLanguageCode':'en','gatewayLanguageQuote':'','contextId':{
        'reference':{
          'bookId':'tit','chapter':1,'verse':4,
        },'tool':WORD_ALIGNMENT,'groupId':'chapter_1',
      },
    };
    let verseEditPath = path.join(CURRENT_PROJECT_PATH, '.apps/translationCore/checkData', 'verseEdits', bookId, '1', '4');
    fs.ensureDirSync(verseEditPath);
    let fileName = generateTimestamp() + '.json';
    fs.outputJsonSync(path.join(verseEditPath, fileName), verseEdit);

    // add 2nd verse edit
    verseEdit = {
      'verseBefore':'To Titus, a true son in our common faith. Grace and peace from God the Father and Christ Jesus our savior.\n\\p','verseAfter':'To Titus, a true son in our common faith. Grace and peace from God the Father and Christ Jesus our savior.\n\\p Edit 1:7','tags':['other'],'userName':'photonomad1','activeBook':'tit','activeChapter':1,'activeVerse':7,'modifiedTimestamp':'2019-05-16T12:11:45.970Z','gatewayLanguageCode':'en','gatewayLanguageQuote':'','contextId':{
        'reference':{
          'bookId':'tit','chapter':1,'verse':7,
        },'tool':WORD_ALIGNMENT,'groupId':'chapter_1',
      },
    };
    verseEditPath = path.join(CURRENT_PROJECT_PATH, '.apps/translationCore/checkData', 'verseEdits', bookId, '1', '7');
    fs.ensureDirSync(verseEditPath);
    fileName = generateTimestamp() + '.json';
    fs.outputJsonSync(path.join(verseEditPath, fileName), verseEdit);

    // when
    await store.dispatch(GroupsDataActions.verifyGroupDataMatchesWithFs(initStore.toolsReducer.selectedTool));

    // then
    const actions = store.getActions();
    expect(cleanOutDates(actions)).toMatchSnapshot();
  });
});

describe('GroupsDataActions.validateBookSelections', () => {
  const bookId = 'tit';
  const selectionsReducer = {
    'gatewayLanguageCode': 'en',
    'gatewayLanguageQuote': 'authority, authorities',
    'selections': [
      {
        'text': 'apostle',
        'occurrence': 1,
        'occurrences': 1,
      },
    ],
    'username': 'dummy-test',
    'modifiedTimestamp': generateTimestamp(),
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

describe('GroupsDataActions.isAttributeChanged', () => {
  describe('reminders', () => {
    it('new value true and old value true is unchanged', () => {
      const newValue = true;
      const oldValue = true;
      const changed = false;
      validateRemindersChanged(newValue, oldValue, changed);
    });
    it('new value false and old value false is unchanged', () => {
      const newValue = false;
      const oldValue = false;
      const changed = false;
      validateRemindersChanged(newValue, oldValue, changed);
    });
    it('new value true and old value false is changed', () => {
      const newValue = true;
      const oldValue = false;
      const changed = true;
      validateRemindersChanged(newValue, oldValue, changed);
    });
    it('new value false and old value undefined is unchanged', () => {
      const newValue = false;
      const oldValue = undefined;
      const changed = false;
      validateRemindersChanged(newValue, oldValue, changed);
    });
    it('new value false and old value null is unchanged', () => {
      const newValue = false;
      const oldValue = null;
      const changed = false;
      validateRemindersChanged(newValue, oldValue, changed);
    });
  });
  describe('invalidated', () => {
    it('new value true and old value true is unchanged', () => {
      const newValue = true;
      const oldValue = true;
      const changed = false;
      validateInvalidationChanged(newValue, oldValue, changed);
    });
    it('new value false and old value false is unchanged', () => {
      const newValue = false;
      const oldValue = false;
      const changed = false;
      validateInvalidationChanged(newValue, oldValue, changed);
    });
    it('new value true and old value false is changed', () => {
      const newValue = true;
      const oldValue = false;
      const changed = true;
      validateInvalidationChanged(newValue, oldValue, changed);
    });
    it('new value false and old value undefined is unchanged', () => {
      const newValue = false;
      const oldValue = undefined;
      const changed = false;
      validateInvalidationChanged(newValue, oldValue, changed);
    });
    it('new value false and old value null is unchanged', () => {
      const newValue = false;
      const oldValue = null;
      const changed = false;
      validateInvalidationChanged(newValue, oldValue, changed);
    });
  });
  describe('comments', () => {
    it('new value string same as old value is unchanged', () => {
      const newValue = 'stuff';
      const oldValue = 'stuff';
      const changed = false;
      validateCommentsChanged(newValue, oldValue, changed);
    });
    it('new value string different than old value string is changed', () => {
      const newValue = 'stuff';
      const oldValue = 'stuff2';
      const changed = true;
      validateCommentsChanged(newValue, oldValue, changed);
    });
    it('new value string and old value true is changed', () => {
      const newValue = 'stuff';
      const oldValue = true;
      const changed = true;
      validateCommentsChanged(newValue, oldValue, changed);
    });
    it('new value string and old value false is changed', () => {
      const newValue = 'stuff';
      const oldValue = false;
      const changed = true;
      validateCommentsChanged(newValue, oldValue, changed);
    });
    it('new value empty string and old value false is unchanged', () => {
      const newValue = '';
      const oldValue = false;
      const changed = false;
      validateCommentsChanged(newValue, oldValue, changed);
    });
    it('new value empty string and old value string is changed', () => {
      const newValue = '';
      const oldValue = 'stuffff';
      const changed = true;
      validateCommentsChanged(newValue, oldValue, changed);
    });
    it('new value empty string and old value empty string is unchanged', () => {
      const newValue = '';
      const oldValue = '';
      const changed = false;
      validateCommentsChanged(newValue, oldValue, changed);
    });
    it('new value null and old value false is unchanged', () => {
      const newValue = null;
      const oldValue = false;
      const changed = false;
      validateCommentsChanged(newValue, oldValue, changed);
    });
    it('new value false and old value null is unchanged', () => {
      const newValue = false;
      const oldValue = null;
      const changed = false;
      validateCommentsChanged(newValue, oldValue, changed);
    });
  });
  describe('selections', () => {
    it('new value selection same as old value is unchanged', () => {
      const newSelectValue = [ { text: 'Jacob', occurrence: 1, occurrences: 2 } ];
      const oldSelectValue = [ { occurrence: 1, occurrences: 2, text: 'Jacob' } ];
      const changed = false;
      validateSelectionsChanged(newSelectValue, oldSelectValue, changed);
    });
    it('new value selection different than old value selection is changed', () => {
      const newSelectValue = [ { text: 'Jacob', occurrence: 1, occurrences: 2 } ];
      const oldSelectValue = [ { text: 'Jacob', occurrence: 2, occurrences: 2 } ];
      const changed = true;
      validateSelectionsChanged(newSelectValue, oldSelectValue, changed);
    });
    it('new value selection different count than old value selection is changed', () => {
      const newSelectValue = [ { text: 'Jacob', occurrence: 1, occurrences: 2 } ];
      const oldSelectValue = [ { text: 'Jacob', occurrence: 1, occurrences: 2 }, { text: 'son', occurrence: 1, occurrences: 4 } ];
      const changed = true;
      validateSelectionsChanged(newSelectValue, oldSelectValue, changed);
    });
    it('new value selection different order than old value selection is unchanged', () => {
      const newSelectValue = [ { text: 'son', occurrence: 1, occurrences: 4 }, { text: 'Jacob', occurrence: 1, occurrences: 2 } ];
      const oldSelectValue = [ { text: 'Jacob', occurrence: 1, occurrences: 2 }, { text: 'son', occurrence: 1, occurrences: 4 } ];
      const changed = true;
      validateSelectionsChanged(newSelectValue, oldSelectValue, changed);
    });
    it('new value selection and old value true is changed', () => {
      const newSelectValue = [ { text: 'Jacob', occurrence: 1, occurrences: 2 } ];
      const oldSelectValue = true;
      const changed = true;
      validateSelectionsChanged(newSelectValue, oldSelectValue, changed);
    });
    it('new value selection and old value false is changed', () => {
      const newSelectValue = [ { text: 'Jacob', occurrence: 1, occurrences: 2 } ];
      const oldSelectValue = false;
      const changed = true;
      validateSelectionsChanged(newSelectValue, oldSelectValue, changed);
    });
    it('new value empty selection and old value false is unchanged', () => {
      const newSelectValue = [];
      const oldSelectValue = false;
      const changed = false;
      validateSelectionsChanged(newSelectValue, oldSelectValue, changed);
    });
    it('new value false and old value empty selection is unchanged', () => {
      const newSelectValue = false;
      const oldSelectValue = [];
      const changed = false;
      validateSelectionsChanged(newSelectValue, oldSelectValue, changed);
    });
    it('new value empty selection and old value selection is changed', () => {
      const newSelectValue = [];
      const oldSelectValue = [ { text: 'Jacob', occurrence: 1, occurrences: 2 } ];
      const changed = true;
      validateSelectionsChanged(newSelectValue, oldSelectValue, changed);
    });
    it('new value null and old value selection is changed', () => {
      const newSelectValue = null;
      const oldSelectValue = [ { text: 'Jacob', occurrence: 1, occurrences: 2 } ];
      const changed = true;
      validateSelectionsChanged(newSelectValue, oldSelectValue, changed);
    });
    it('new value empty selection and old value empty selection is unchanged', () => {
      const newSelectValue = [];
      const oldSelectValue = [];
      const changed = false;
      validateSelectionsChanged(newSelectValue, oldSelectValue, changed);
    });
    it('new value null and old value false is unchanged', () => {
      const newSelectValue = null;
      const oldSelectValue = false;
      const changed = false;
      validateSelectionsChanged(newSelectValue, oldSelectValue, changed);
    });
    it('new value undefined and old value false is unchanged', () => {
      const newSelectValue = undefined;
      const oldSelectValue = false;
      const changed = false;
      validateSelectionsChanged(newSelectValue, oldSelectValue, changed);
    });
    it('new value false and old value null is unchanged', () => {
      const newSelectValue = false;
      const oldSelectValue = null;
      const changed = false;
      validateSelectionsChanged(newSelectValue, oldSelectValue, changed);
    });
  });
  describe('nothingToSelect', () => {
    it('new nothingToSelect value true and old value true is unchanged', () => {
      const newNoSelectValue = true;
      const oldNoSelectValue = true;
      const changed = false;
      validateNothingToSelectChanged(newNoSelectValue, oldNoSelectValue, changed);
    });
    it('new nothingToSelect value false and old value false is unchanged', () => {
      const newNoSelectValue = false;
      const oldNoSelectValue = false;
      const changed = false;
      validateNothingToSelectChanged(newNoSelectValue, oldNoSelectValue, changed);
    });
    it('new nothingToSelect value true and old value false is changed', () => {
      const newNoSelectValue = true;
      const oldNoSelectValue = false;
      const changed = true;
      validateNothingToSelectChanged(newNoSelectValue, oldNoSelectValue, changed);
    });
    it('new nothingToSelect value false and old value true is changed', () => {
      const newNoSelectValue = false;
      const oldNoSelectValue = true;
      const changed = true;
      validateNothingToSelectChanged(newNoSelectValue, oldNoSelectValue, changed);
    });
    it('new value false and old value null is unchanged', () => {
      const newNoSelectValue = false;
      const oldNoSelectValue = null;
      const changed = false;
      validateNothingToSelectChanged(newNoSelectValue, oldNoSelectValue, changed);
    });
    it('new value null and old value false is unchanged', () => {
      const newNoSelectValue = null;
      const oldNoSelectValue = false;
      const changed = false;
      validateNothingToSelectChanged(newNoSelectValue, oldNoSelectValue, changed);
    });
  });
  describe('verseEdits', () => {
    it('old value true is unchanged', () => {
      const oldValue = true;
      const changed = false;
      validateVerseEdits(oldValue, changed);
    });
    it('old value false is changed', () => {
      const oldValue = false;
      const changed = true;
      validateVerseEdits(oldValue, changed);
    });
    it('old value null is changed', () => {
      const oldValue = null;
      const changed = true;
      validateVerseEdits(oldValue, changed);
    });
  });
  describe('unsupported', () => {
    it('unsupported checks are always false', () => {
      const newValue = true;
      const oldValue = null;
      const expectChange = false;
      const checkAttr = 'unsupported';
      const object = { [checkAttr]: newValue };
      const oldGroupObject = { [checkAttr]: oldValue };

      // when
      const result = GroupsDataActions.isAttributeChanged(object, checkAttr, oldGroupObject);

      // then
      expect(result === expectChange).toBeTruthy();
    });
  });
});

//
// helpers
//

function validateVerseEdits(oldValue, expectChange) {
  const checkAttr = 'verseEdits';
  const object = {};
  const oldGroupObject = { [checkAttr]: oldValue };
  const result = GroupsDataActions.isAttributeChanged(object, checkAttr, oldGroupObject);
  expect(result === expectChange).toBeTruthy();
}

function validateCommentsChanged(newValue, oldValue, expectChange) {
  const checkAttr = 'comments';
  const attr = 'text';
  const object = { [attr]: newValue };
  const oldGroupObject = { [checkAttr]: oldValue };
  const result = GroupsDataActions.isAttributeChanged(object, checkAttr, oldGroupObject);
  expect(result === expectChange).toBeTruthy();
}

function validateInvalidationChanged(newValue, oldValue, expectChange) {
  const checkAttr = 'invalidated';
  const object = { [checkAttr]: newValue };
  const oldGroupObject = { [checkAttr]: oldValue };
  const result = GroupsDataActions.isAttributeChanged(object, checkAttr, oldGroupObject);
  expect(result === expectChange).toBeTruthy();
}

function validateSelectionsChanged(newSelectValue, oldSelectValue, expectChange, newNoSelectValue = undefined, oldNoSelectValue= false) {
  const checkAttr = 'selections';
  const object = { [checkAttr]: newSelectValue, ['nothingToSelect']: newNoSelectValue };
  const oldGroupObject = { [checkAttr]: oldSelectValue, ['nothingToSelect']: oldNoSelectValue };
  const result = GroupsDataActions.isAttributeChanged(object, checkAttr, oldGroupObject);
  expect(result === expectChange).toBeTruthy();
}

function validateNothingToSelectChanged(newNoSelectValue, oldNoSelectValue, expectChange) {
  validateSelectionsChanged(null, false, expectChange, newNoSelectValue, oldNoSelectValue);
}

function validateRemindersChanged(newValue, oldValue, expectChange) {
  const checkAttr = 'reminders';
  const attr = 'enabled';
  const object = { [attr]: newValue };
  const oldGroupObject = { [checkAttr]: oldValue };
  const result = GroupsDataActions.isAttributeChanged(object, checkAttr, oldGroupObject);
  expect(result === expectChange).toBeTruthy();
}

function cleanOutDates(actions) {
  const cleanedActions = JSON.parse(JSON.stringify(actions));

  for (let action of cleanedActions) {
    if (action.modifiedTimestamp) {
      delete action.modifiedTimestamp;
    }
  }
  return cleanedActions;
}

function getInitialStateData(bookId, checkPath, projectPath) {
  const contextId = {
    reference: {
      bookId: bookId,
      chapter: 1,
      verse: 1,
    },
    groupId: '',
  };
  const groupsDataReducer = fs.readJSONSync(
    path.join(checkPath, 'groupsDataReducer.json'));
  const groupsIndexReducer = fs.readJSONSync(
    path.join(checkPath, 'groupsIndexReducer.json'));
  const targetBible = {
    1: fs.readJSONSync(path.join(projectPath, '1.json')),
    2: fs.readJSONSync(path.join(projectPath, '2.json')),
    3: fs.readJSONSync(path.join(projectPath, '3.json')),
  };

  const initialState = {
    actions: {},
    groupsDataReducer,
    groupsIndexReducer,
    projectInformationCheckReducer: { bookId },
    resourcesReducer: { bibles: { targetLanguage: { targetBible } } },
    toolsReducer: { selectedTool: TRANSLATION_WORDS },
    loginReducer: {
      loggedInUser: false,
      userdata: { username: 'dummy-test' },
    },
    projectDetailsReducer: {
      manifest: {
        project: { id: bookId },
        toolsSelectedGLs: { translationWords: 'en' },
      },
      projectSaveLocation: path.resolve(checkPath),
      currentToolName: TRANSLATION_WORDS,
    },
    contextIdReducer: { contextId },
  };
  return initialState;
}

function removeSpy(spy) {
  if (spy) {
    spy.mockReset();
    spy.mockRestore();
  }
}

function initiMockStore(bookId, selectionsReducer, chapter = null, verse = null, targetVerse = null) {
  const checkPath = path.join(FIXTURES_CHECKDATA_PATH, 'en_tit');
  const projectPath = path.join(CURRENT_PROJECT_PATH, 'tit');
  const initialState = getInitialStateData(bookId, checkPath, projectPath);
  initialState.selectionsReducer = selectionsReducer;
  initialState.projectDetailsReducer = {
    ...initialState.projectDetailsReducer,
    projectSaveLocation: CURRENT_PROJECT_PATH,
    manifest: {
      ...initialState.projectDetailsReducer.manifest,
      project: { id: bookId },
    },
  };

  if (typeof targetVerse === 'string') {
    const bibleChapter = initialState.resourcesReducer.bibles.targetLanguage.targetBible[chapter];
    bibleChapter[verse] = targetVerse;
  }
  return mockStore(initialState);
}

