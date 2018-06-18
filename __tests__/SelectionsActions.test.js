import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import path from 'path-extra';
import fs from "fs-extra";
// actions
import {generateTimestamp} from "../src/js/helpers";
import * as SelectionsActions from '../src/js/actions/SelectionsActions';
import * as saveMethods from "../src/js/localStorage/saveMethods";
// constants
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
const PROJECTS_PATH = path.join(__dirname, 'fixtures', 'checkData');

fs.__loadDirIntoMockFs(PROJECTS_PATH, PROJECTS_PATH);

describe('SelectionsActions.validateAllSelectionsForVerse', () => {
  const bookId = 'tit';
  let saveOtherContextSpy = null;

  beforeEach(() => {
    saveOtherContextSpy = jest.spyOn(saveMethods, 'saveSelectionsForOtherContext');
  });

  afterEach(() => {
    if(saveOtherContextSpy) {
      saveOtherContextSpy.mockReset();
      saveOtherContextSpy.mockRestore();
    }
  });

  it('No selection changes', () => {
    // given
    const targetVerse =  "Paul, a servant of God and an apostle of Jesus Christ, for the faith of God's chosen people and the knowledge of the truth that agrees with godliness, ";
    const projectPath = path.join(PROJECTS_PATH, 'en_tit');
    const store = initStoreData(projectPath, bookId);
    const results = {
      selectionsChanged: false
    };

    // when
    store.dispatch(SelectionsActions.validateAllSelectionsForVerse(targetVerse, results));

    // then
    const actions = store.getActions();
    expect(actions.length).toEqual(0);
    expect(saveOtherContextSpy).toHaveBeenCalledTimes(0);
  });

  it('apostle selection edited', () => {
    // given
    const targetVerse =  "Paul, a servant of God and an apostl2 of Jesus Christ, for the faith of God's chosen people and the knowledge of the truth that agrees with godliness, ";
    const projectPath = path.join(PROJECTS_PATH, 'en_tit');
    const store = initStoreData(projectPath, bookId);
    const results = {
      selectionsChanged: false
    };

    // when
    store.dispatch(SelectionsActions.validateAllSelectionsForVerse(targetVerse, results));

    // then
    const actions = store.getActions();
    expect(cleanOutDates(actions)).toMatchSnapshot();
    expect(saveOtherContextSpy).toHaveBeenCalledTimes(0);
  });

  it('all selections edited', () => {
    // given
    const targetVerse =  "";
    const projectPath = path.join(PROJECTS_PATH, 'en_tit');
    const store = initStoreData(projectPath, bookId);
    const results = {
      selectionsChanged: false
    };

    // when
    store.dispatch(SelectionsActions.validateAllSelectionsForVerse(targetVerse, results));

    // then
    const actions = store.getActions();
    expect(cleanOutDates(actions)).toMatchSnapshot();
    expect(saveOtherContextSpy).toHaveBeenCalledTimes(1);
  });
});

describe('SelectionsActions.validateSelections', () => {
  const bookId = 'tit';
  const selectionsReducer = {
    gatewayLanguageCode: "en",
    gatewayLanguageQuote: "authority, authorities",
    "selections": [
      {
        "text": "apostle",
        "occurrence": 1,
        "occurrences": 1
      }
    ],
    username: 'dummy-test',
    modifiedTimestamp: generateTimestamp()
  };
  let saveOtherContextSpy = null;

  beforeEach(() => {
    saveOtherContextSpy = jest.spyOn(saveMethods, 'saveSelectionsForOtherContext');
  });

  afterEach(() => {
    if(saveOtherContextSpy) {
      saveOtherContextSpy.mockReset();
      saveOtherContextSpy.mockRestore();
    }
  });

  it('No selection changes', () => {
    // given
    const targetVerse = "Paul, a servant of God and an apostle of Jesus Christ, for the faith of God's chosen people and the knowledge of the truth that agrees with godliness, ";
    const projectPath = path.join(PROJECTS_PATH, 'en_tit');
    const initialState = getInitialStateData(bookId, projectPath);
    initialState.selectionsReducer = selectionsReducer;
    const store = mockStore(initialState);

    // when
    store.dispatch(SelectionsActions.validateSelections(targetVerse));

    // then
    const actions = store.getActions();
    expect(actions.length).toEqual(0);
    expect(saveOtherContextSpy).toHaveBeenCalledTimes(0);
  });

  it('apostle selection edited', () => {
    // given
    const targetVerse =  "Paul, a servant of God and an apostl2 of Jesus Christ, for the faith of God's chosen people and the knowledge of the truth that agrees with godliness, ";
    const projectPath = path.join(PROJECTS_PATH, 'en_tit');
    const initialState = getInitialStateData(bookId, projectPath);
    initialState.selectionsReducer = selectionsReducer;
    const store = mockStore(initialState);

    // when
    store.dispatch(SelectionsActions.validateSelections(targetVerse));

    // then
    const actions = store.getActions();
    expect(cleanOutDates(actions)).toMatchSnapshot();
    expect(saveOtherContextSpy).toHaveBeenCalledTimes(0);
  });

  it('god selection edited in different context', () => {
    // given
    const targetVerse =  "Paul, a servant of Go and an apostle of Jesus Christ, for the faith of God's chosen people and the knowledge of the truth that agrees with godliness, ";
    const projectPath = path.join(PROJECTS_PATH, 'en_tit');
    const initialState = getInitialStateData(bookId, projectPath);
    initialState.selectionsReducer = selectionsReducer;
    const store = mockStore(initialState);

    // when
    store.dispatch(SelectionsActions.validateSelections(targetVerse));

    // then
    const actions = store.getActions();
    expect(cleanOutDates(actions)).toMatchSnapshot();
    expect(saveOtherContextSpy).toHaveBeenCalledTimes(1);
  });

  it('all selections edited', () => {
    // given
    const targetVerse =  "";
    const projectPath = path.join(PROJECTS_PATH, 'en_tit');
    const initialState = getInitialStateData(bookId, projectPath);
    initialState.selectionsReducer = selectionsReducer;
    const store = mockStore(initialState);

    // when
    store.dispatch(SelectionsActions.validateSelections(targetVerse));

    // then
    const actions = store.getActions();
    expect(cleanOutDates(actions)).toMatchSnapshot();
    expect(saveOtherContextSpy).toHaveBeenCalledTimes(1);
  });

  it('all selections edited current context', () => {
    // given
    const targetVerse =  "";
    const projectPath = path.join(PROJECTS_PATH, 'en_tit');
    const initialState = getInitialStateData(bookId, projectPath);
    initialState.selectionsReducer = selectionsReducer;
    const store = mockStore(initialState);

    // when
    store.dispatch(SelectionsActions.validateSelections(targetVerse, initialState.contextIdReducer.contextId));

    // then
    const actions = store.getActions();
    expect(cleanOutDates(actions)).toMatchSnapshot();
    expect(saveOtherContextSpy).toHaveBeenCalledTimes(1);
  });
  it('all selections edited from different verse context', () => {
    // given
    const targetVerse = "";
    const projectPath = path.join(PROJECTS_PATH, 'en_tit');
    const initialState = getInitialStateData(bookId, projectPath);
    initialState.selectionsReducer = selectionsReducer;
    const contextId = JSON.parse(JSON.stringify(initialState.contextIdReducer.contextId));
    initialState.contextIdReducer.contextId.reference.verse = "4";
    initialState.contextIdReducer.contextId.groupId = "faith";
    const store = mockStore(initialState);

    // when
    store.dispatch(SelectionsActions.validateSelections(targetVerse, contextId));

    // then
    const actions = store.getActions();
    expect(cleanOutDates(actions)).toMatchSnapshot();
  });
});

describe('SelectionsActions.changeSelections', () => {
  const bookId = 'tit';
  const selectionsReducer = {
    gatewayLanguageCode: "en",
    gatewayLanguageQuote: "authority, authorities",
    "selections": [
      {
        "text": "apostle",
        "occurrence": 1,
        "occurrences": 1
      }
    ],
    username: 'dummy-test',
    modifiedTimestamp: generateTimestamp()
  };
  let saveOtherContextSpy = null;

  beforeEach(() => {
    saveOtherContextSpy = jest.spyOn(saveMethods, 'saveSelectionsForOtherContext');
  });

  afterEach(() => {
    if(saveOtherContextSpy) {
      saveOtherContextSpy.mockReset();
      saveOtherContextSpy.mockRestore();
    }
  });

  it('Set selection change', () => {
    // given
    const projectPath = path.join(PROJECTS_PATH, 'en_tit');
    const initialState = getInitialStateData(bookId, projectPath);
    initialState.selectionsReducer = selectionsReducer;
    const store = mockStore(initialState);
    // when
    store.dispatch(SelectionsActions.changeSelections(selectionsReducer.selections, store.getState().username));

    // then
    const actions = store.getActions();
    expect(cleanOutDates(actions)).toMatchSnapshot();
    expect(saveOtherContextSpy).toHaveBeenCalledTimes(0);
  });

  it('Set selection change on different contextId', () => {
    // given
    const projectPath = path.join(PROJECTS_PATH, 'en_tit');
    const contextId = {
      reference: {
        bookId: bookId,
        chapter: 1,
        verse: 1
      },
      groupId: 'authority'
    };
    const initialState = getInitialStateData(bookId, projectPath);
    initialState.selectionsReducer = selectionsReducer;
    const store = mockStore(initialState);
    // when
    store.dispatch(SelectionsActions.changeSelections(selectionsReducer.selections, store.getState().username, false, contextId));

    // then
    const actions = store.getActions();
    expect(cleanOutDates(actions)).toMatchSnapshot();
    expect(saveOtherContextSpy).toHaveBeenCalledTimes(1);
  });
});

//
// helpers
//

function cleanOutDates(actions) {
  const cleanedActions = JSON.parse(JSON.stringify(actions));
  for (let action of cleanedActions) {
    if (action.modifiedTimestamp) {
      delete action.modifiedTimestamp;
    }
  }
  return cleanedActions;
}

function getInitialStateData(bookId, projectPath) {
  const contextId = {
    reference: {
      bookId: bookId,
      chapter: 1,
      verse: 1
    },
    groupId: 'apostle',
    tool: 'translationWords'
  };
  const groupsDataReducer = fs.readJSONSync(path.join(projectPath, 'groupsDataReducer.json'));
  const groupsIndexReducer = fs.readJSONSync(path.join(projectPath, 'groupsIndexReducer.json'));

  const initialState = {
    actions: {},
    groupsDataReducer,
    groupsIndexReducer,
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
      projectSaveLocation: path.resolve(projectPath),
      currentProjectToolsSelectedGL: {
        translationWords: 'en'
      }
    },
    contextIdReducer: {
      contextId
    }
  };
  return initialState;
}

function initStoreData(projectPath, bookId) {
  const initialState = getInitialStateData(bookId, projectPath);
  return mockStore(initialState);
}
