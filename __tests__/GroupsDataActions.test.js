jest.mock('../src/js/actions/ResourcesActions', () => ({
  addNewBible: () => {
    return mock_addNewBible();
  }
}));
import fs from 'fs-extra';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import path from 'path-extra';
// actions
import { generateTimestamp } from '../src/js/helpers';
import * as GroupsDataActions from '../src/js/actions/GroupsDataActions';
import * as saveMethods from '../src/js/localStorage/saveMethods';

// constants
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
const CHECK_DATA_PATH = path.join(__dirname, 'fixtures/checkData');
const PROJECTS_PATH = path.join(__dirname, 'fixtures/project/en_tit');
let mock_addNewBible = jest.fn();

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
    mock_addNewBible = jest.fn(() => { return () => {}; });
    saveOtherContextSpy = jest.spyOn(saveMethods,
      'saveSelectionsForOtherContext');
    fs.__loadDirIntoMockFs(CHECK_DATA_PATH, CHECK_DATA_PATH);
    fs.__loadDirIntoMockFs(PROJECTS_PATH, PROJECTS_PATH);
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
    expect(mock_addNewBible).toHaveBeenCalledTimes(3);
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
    expect(mock_addNewBible).toHaveBeenCalledTimes(3);
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
    expect(mock_addNewBible).toHaveBeenCalledTimes(3);
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
      currentToolName: 'translationWords'
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
      currentToolName: 'translationWords'
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
  const checkPath = path.join(CHECK_DATA_PATH, 'en_tit');
  const projectPath = path.join(PROJECTS_PATH, 'tit');
  const initialState = getInitialStateData(bookId, checkPath, projectPath);
  initialState.selectionsReducer = selectionsReducer;
  initialState.projectDetailsReducer = {
    ...initialState.projectDetailsReducer,
    projectSaveLocation: PROJECTS_PATH,
    manifest: {project: {id: bookId}}
  };

  if (typeof targetVerse === 'string') {
    const bibleChapter = initialState.resourcesReducer.bibles.targetLanguage.targetBible[chapter];
    bibleChapter[verse] = targetVerse;
  }
  return mockStore(initialState);
}

