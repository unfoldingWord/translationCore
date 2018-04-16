import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import path from 'path-extra';
import fs from "fs-extra";
// actions
import {generateTimestamp} from "../src/js/helpers";
import * as SelectionsActions from '../src/js/actions/SelectionsActions';
// constants
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
const PROJECTS_PATH = path.join(__dirname, 'fixtures', 'checkData');

jest.unmock('fs-extra');

describe('SelectionsActions.validateAllSelectionsForVerse', () => {
  const bookId = 'tit';

  it('No selection changes', () => {
    // given
    const targetVerse =  "Paul, a servant of God and an apostle of Jesus Christ, for the faith of God's chosen people and the knowledge of the truth that agrees with godliness, ";
    const projectPath = path.join(PROJECTS_PATH, 'en_tit');
    const store = initGroupData(projectPath, bookId);
    const results = {
      selectionsChanged: false
    };

    // when
    store.dispatch(SelectionsActions.validateAllSelectionsForVerse(targetVerse, results));

    // then
    const actions = store.getActions();
    expect(actions.length).toEqual(0);
  });

  it('apostle selection edited', () => {
    // given
    const targetVerse =  "Paul, a servant of God and an apostl2 of Jesus Christ, for the faith of God's chosen people and the knowledge of the truth that agrees with godliness, ";
    const projectPath = path.join(PROJECTS_PATH, 'en_tit');
    const store = initGroupData(projectPath, bookId);
    const results = {
      selectionsChanged: false
    };

    // when
    store.dispatch(SelectionsActions.validateAllSelectionsForVerse(targetVerse, results));

    // then
    const actions = store.getActions();
    expect(cleanOutDates(actions)).toMatchSnapshot();
  });

  it('all selections edited', () => {
    // given
    const targetVerse =  "";
    const projectPath = path.join(PROJECTS_PATH, 'en_tit');
    const store = initGroupData(projectPath, bookId);
    const results = {
      selectionsChanged: false
    };

    // when
    store.dispatch(SelectionsActions.validateAllSelectionsForVerse(targetVerse, results));

    // then
    const actions = store.getActions();
    expect(cleanOutDates(actions)).toMatchSnapshot();
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

  it('No selection changes', () => {
    // given
    const targetVerse = "Paul, a servant of God and an apostle of Jesus Christ, for the faith of God's chosen people and the knowledge of the truth that agrees with godliness, ";
    const projectPath = path.join(PROJECTS_PATH, 'en_tit');
    const store = initGroupData(projectPath, bookId, selectionsReducer);

    // when
    store.dispatch(SelectionsActions.validateSelections(targetVerse));

    // then
    const actions = store.getActions();
    expect(actions.length).toEqual(0);
  });

  it('apostle selection edited', () => {
    // given
    const targetVerse =  "Paul, a servant of God and an apostl2 of Jesus Christ, for the faith of God's chosen people and the knowledge of the truth that agrees with godliness, ";
    const projectPath = path.join(PROJECTS_PATH, 'en_tit');
    const store = initGroupData(projectPath, bookId, selectionsReducer);

    // when
    store.dispatch(SelectionsActions.validateSelections(targetVerse));

    // then
    const actions = store.getActions();
    expect(cleanOutDates(actions)).toMatchSnapshot();
  });

  it('god selection edited in different context', () => {
    // given
    const targetVerse =  "Paul, a servant of Go and an apostle of Jesus Christ, for the faith of God's chosen people and the knowledge of the truth that agrees with godliness, ";
    const projectPath = path.join(PROJECTS_PATH, 'en_tit');
    const store = initGroupData(projectPath, bookId, selectionsReducer);

    // when
    store.dispatch(SelectionsActions.validateSelections(targetVerse));

    // then
    const actions = store.getActions();
    expect(cleanOutDates(actions)).toMatchSnapshot();
  });

  it('all selections edited', () => {
    // given
    const targetVerse =  "";
    const projectPath = path.join(PROJECTS_PATH, 'en_tit');
    const store = initGroupData(projectPath, bookId, selectionsReducer);

    // when
    store.dispatch(SelectionsActions.validateSelections(targetVerse));

    // then
    const actions = store.getActions();
    expect(cleanOutDates(actions)).toMatchSnapshot();
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

function initGroupData(projectPath, bookId, selectionsReducer) {
  const contextId = {
    reference: {
      bookId: bookId,
      chapter:1,
      verse: 1
    },
    groupId: 'apostle'
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
  if (selectionsReducer) {
    initialState.selectionsReducer = selectionsReducer;
  }
  return mockStore(initialState);
}

