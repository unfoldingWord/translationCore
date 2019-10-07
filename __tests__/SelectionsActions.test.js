import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import path from 'path-extra';
import fs from 'fs-extra';
import * as selections from 'selections';
import _ from 'lodash';
// actions
import { generateTimestamp } from '../src/js/helpers';
import * as SelectionsActions from '../src/js/actions/SelectionsActions';
import * as saveMethods from '../src/js/localStorage/saveMethods';
import {
  WORD_ALIGNMENT,
  TRANSLATION_WORDS,
  ALERT_SELECTIONS_INVALIDATED_ID,
  ALERT_SELECTIONS_INVALIDATED_MSG,
  ALERT_ALIGNMENTS_RESET_ID,
  ALERT_ALIGNMENTS_RESET_MSG,
  ALERT_ALIGNMENTS_AND_SELECTIONS_RESET_MSG,
} from '../src/js/common/constants';

jest.mock('fs-extra');
// constants
const FIXTURE_PROJECTS_PATH = path.join(__dirname, 'fixtures', 'checkData');
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('../src/js/helpers/gatewayLanguageHelpers', () => ({
  getGatewayLanguageCodeAndQuote: () => ({
    gatewayLanguageCode: 'en',
    gatewayLanguageQuote: 'authority',
  }),
}));

jest.mock('redux-batched-actions', () => ({
  batchActions: (actionsBatch) => (dispatch) => {
    if (actionsBatch.length) {
      for (let action of actionsBatch) {
        dispatch(action);
      }
    }
  },
}));


fs.__loadDirIntoMockFs(FIXTURE_PROJECTS_PATH, FIXTURE_PROJECTS_PATH);

describe('SelectionsActions.validateAllSelectionsForVerse', () => {
  const bookId = 'tit';
  let saveOtherContextSpy = null;

  beforeEach(() => {
    saveOtherContextSpy = jest.spyOn(saveMethods, 'saveSelectionsForOtherContext');
  });

  afterEach(() => {
    if (saveOtherContextSpy) {
      saveOtherContextSpy.mockReset();
      saveOtherContextSpy.mockRestore();
    }
  });

  it('No selection changes', () => {
    // given
    const targetVerse = 'Paul, a servant of God and an apostle of Jesus Christ, for the faith of God\'s chosen people and the knowledge of the truth that agrees with godliness, ';
    const projectPath = path.join(FIXTURE_PROJECTS_PATH, 'en_tit');
    const store = initStoreData(projectPath, bookId);
    const results = { selectionsChanged: false };

    // when
    store.dispatch(SelectionsActions.validateAllSelectionsForVerse(targetVerse, results));

    // then
    const actions = store.getActions();
    expect(actions.length).toEqual(0);
    expect(saveOtherContextSpy).toHaveBeenCalledTimes(0);
  });

  it('apostle selection edited', () => {
    // given
    const targetVerse = 'Paul, a servant of God and an apostl2 of Jesus Christ, for the faith of God\'s chosen people and the knowledge of the truth that agrees with godliness, ';
    const projectPath = path.join(FIXTURE_PROJECTS_PATH, 'en_tit');
    const store = initStoreData(projectPath, bookId);
    const results = { selectionsChanged: false };

    // when
    store.dispatch(SelectionsActions.validateAllSelectionsForVerse(targetVerse, results));

    // then
    const actions = store.getActions();
    expect(cleanOutDates(actions)).toMatchSnapshot();
    expect(saveOtherContextSpy).toHaveBeenCalledTimes(0);
  });

  it('all selections edited', () => {
    // given
    const targetVerse = '';
    const projectPath = path.join(FIXTURE_PROJECTS_PATH, 'en_tit');
    const store = initStoreData(projectPath, bookId);
    const results = { selectionsChanged: false };

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
    gatewayLanguageCode: 'en',
    gatewayLanguageQuote: 'authority',
    selections: [
      {
        'text': 'apostle',
        'occurrence': 1,
        'occurrences': 1,
      },
    ],
    username: 'dummy-test',
    modifiedTimestamp: generateTimestamp(),
  };
  let saveOtherContextSpy = null;

  beforeEach(() => {
    saveOtherContextSpy = jest.spyOn(saveMethods, 'saveSelectionsForOtherContext');
  });

  afterEach(() => {
    if (saveOtherContextSpy) {
      saveOtherContextSpy.mockReset();
      saveOtherContextSpy.mockRestore();
    }
  });

  describe('Active Tool TW', () => {
    it('No selection changes', () => {
      // given
      const targetVerse = 'Paul, a servant of God and an apostle of Jesus Christ, for the faith of God\'s chosen people and the knowledge of the truth that agrees with godliness, ';
      const projectPath = path.join(FIXTURE_PROJECTS_PATH, 'en_tit');
      const initialState = getInitialStateData(bookId, projectPath);
      initialState.selectionsReducer = selectionsReducer;
      const store = mockStore(initialState);
      const results = {};
      const expectedSelectionsChanged = false;

      // when
      store.dispatch(SelectionsActions.validateSelections(targetVerse, null, null, null, true, results));

      // then
      expect(results.selectionsChanged).toEqual(expectedSelectionsChanged);
      const actions = store.getActions();
      expect(actions.length).toEqual(0);
      expect(saveOtherContextSpy).toHaveBeenCalledTimes(0);
    });

    it('No previous selection changes', () => {
      // given
      const targetVerse = 'A verse';
      const projectPath = path.join(FIXTURE_PROJECTS_PATH, 'en_tit');
      const initialState = getInitialStateData(bookId, projectPath);
      initialState.contextIdReducer.contextId.reference.verse = 15;
      initialState.contextIdReducer.contextId.groupId = 'believe';
      const store = mockStore(initialState);
      const checkSelectionOccurrencesSpy = jest.spyOn(selections, 'checkSelectionOccurrences');

      // when
      store.dispatch(SelectionsActions.validateSelections(targetVerse));

      // then
      const actions = store.getActions();
      expect(actions.length).toEqual(0);
      expect(checkSelectionOccurrencesSpy).toHaveBeenCalledWith('A verse', expect.any(Array));
    });

    it('apostle selection edited', () => {
      // given
      const targetVerse = 'Paul, a servant of God and an apostl2 of Jesus Christ, for the faith of God\'s chosen people and the knowledge of the truth that agrees with godliness, ';
      const projectPath = path.join(FIXTURE_PROJECTS_PATH, 'en_tit');
      const initialState = getInitialStateData(bookId, projectPath);
      initialState.selectionsReducer = selectionsReducer;
      const store = mockStore(initialState);
      const results = {};
      const expectedSelectionsChanged = false;

      // when
      store.dispatch(SelectionsActions.validateSelections(targetVerse, null, null, null, true, results));

      // then
      expect(results.selectionsChanged).toEqual(expectedSelectionsChanged);
      const actions = store.getActions();
      expect(cleanOutDates(actions)).toMatchSnapshot();
      expect(saveOtherContextSpy).toHaveBeenCalledTimes(0);
    });

    it('god selection edited in different context', () => {
      // given
      const targetVerse = 'Paul, a servant of Go and an apostle of Jesus Christ, for the faith of God\'s chosen people and the knowledge of the truth that agrees with godliness, ';
      const projectPath = path.join(FIXTURE_PROJECTS_PATH, 'en_tit');
      const initialState = getInitialStateData(bookId, projectPath);
      initialState.selectionsReducer = selectionsReducer;
      const store = mockStore(initialState);
      const results = {};
      const expectedSelectionsChanged = true;

      // when
      store.dispatch(SelectionsActions.validateSelections(targetVerse, null, null, null, true, results));

      // then
      expect(results.selectionsChanged).toEqual(expectedSelectionsChanged);
      const actions = store.getActions();
      expect(cleanOutDates(actions)).toMatchSnapshot();
      expect(saveOtherContextSpy).toHaveBeenCalledTimes(1);
    });

    it('"servant of God" selection with footnote not edited', () => {
      // given
      const targetVerse = 'Paul, a servant of God and an apostle of Jesus Christ, for the faith of God\'s chosen people and the knowledge of the truth that agrees with godliness,  \\f + \\ft lookup servant of God\\f*';
      const projectPath = path.join(FIXTURE_PROJECTS_PATH, 'en_tit');
      const initialState = getInitialStateData(bookId, projectPath);
      initialState.selectionsReducer = selectionsReducer;
      const store = mockStore(initialState);
      const results = {};
      const expectedSelectionsChanged = false;

      // when
      store.dispatch(SelectionsActions.validateSelections(targetVerse, null, null, null, true, results));

      // then
      expect(results.selectionsChanged).toEqual(expectedSelectionsChanged);
      const actions = store.getActions();
      expect(cleanOutDates(actions)).toMatchSnapshot();
      expect(saveOtherContextSpy).toHaveBeenCalledTimes(0);
    });

    it('"servant of God" selection with footnote and edited', () => {
      // given
      const targetVerse = 'Paul, a servan of God and an apostle of Jesus Christ, for the faith of God\'s chosen people and the knowledge of the truth that agrees with godliness,  \\f + \\ft lookup servant of God\\f*';
      const projectPath = path.join(FIXTURE_PROJECTS_PATH, 'en_tit');
      const initialState = getInitialStateData(bookId, projectPath);
      initialState.selectionsReducer = selectionsReducer;
      const store = mockStore(initialState);
      const results = {};
      const expectedSelectionsChanged = true;

      // when
      store.dispatch(SelectionsActions.validateSelections(targetVerse, null, null, null, true, results));

      // then
      expect(results.selectionsChanged).toEqual(expectedSelectionsChanged);
      const actions = store.getActions();
      expect(cleanOutDates(actions)).toMatchSnapshot();
      expect(saveOtherContextSpy).toHaveBeenCalledTimes(1);
    });

    it('all selections edited', () => {
      // given
      const targetVerse = '';
      const projectPath = path.join(FIXTURE_PROJECTS_PATH, 'en_tit');
      const initialState = getInitialStateData(bookId, projectPath);
      initialState.selectionsReducer = selectionsReducer;
      const store = mockStore(initialState);
      const results = {};
      const expectedSelectionsChanged = true;

      // when
      store.dispatch(SelectionsActions.validateSelections(targetVerse, null, null, null, true, results));

      // then
      expect(results.selectionsChanged).toEqual(expectedSelectionsChanged);
      const actions = store.getActions();
      expect(cleanOutDates(actions)).toMatchSnapshot();
      expect(saveOtherContextSpy).toHaveBeenCalledTimes(1);
    });

    it('all selections edited current context', () => {
      // given
      const targetVerse = '';
      const projectPath = path.join(FIXTURE_PROJECTS_PATH, 'en_tit');
      const initialState = getInitialStateData(bookId, projectPath);
      initialState.selectionsReducer = selectionsReducer;
      const store = mockStore(initialState);
      const results = {};
      const expectedSelectionsChanged = true;

      // when
      store.dispatch(SelectionsActions.validateSelections(targetVerse, initialState.contextIdReducer.contextId,
        null, null, true, results));

      // then
      expect(results.selectionsChanged).toEqual(expectedSelectionsChanged);
      const actions = store.getActions();
      expect(cleanOutDates(actions)).toMatchSnapshot();
      expect(saveOtherContextSpy).toHaveBeenCalledTimes(1);
    });

    it('all selections edited from different verse context', () => {
      // given
      const targetVerse = '';
      const projectPath = path.join(FIXTURE_PROJECTS_PATH, 'en_tit');
      const initialState = getInitialStateData(bookId, projectPath);
      initialState.selectionsReducer = selectionsReducer;
      const contextId = JSON.parse(JSON.stringify(initialState.contextIdReducer.contextId));
      initialState.contextIdReducer.contextId.reference.verse = '4';
      initialState.contextIdReducer.contextId.groupId = 'faith';
      const store = mockStore(initialState);
      const results = {};
      const expectedSelectionsChanged = true;

      // when
      store.dispatch(SelectionsActions.validateSelections(targetVerse, contextId, null, null, true, results));

      // then
      expect(results.selectionsChanged).toEqual(expectedSelectionsChanged);
      const actions = store.getActions();
      expect(cleanOutDates(actions)).toMatchSnapshot();
    });

    it('all selections edited from different verse context - no warning', () => {
      // given
      const targetVerse = '';
      const projectPath = path.join(FIXTURE_PROJECTS_PATH, 'en_tit');
      const initialState = getInitialStateData(bookId, projectPath);
      initialState.selectionsReducer = selectionsReducer;
      const contextId = JSON.parse(JSON.stringify(initialState.contextIdReducer.contextId));
      initialState.contextIdReducer.contextId.reference.verse = '4';
      initialState.contextIdReducer.contextId.groupId = 'faith';
      const store = mockStore(initialState);
      const results = {};
      const expectedSelectionsChanged = true;

      // when
      store.dispatch(SelectionsActions.validateSelections(targetVerse, contextId, null, null, false, results));

      // then
      expect(results.selectionsChanged).toEqual(expectedSelectionsChanged);
      const actions = store.getActions();
      expect(cleanOutDates(actions)).toMatchSnapshot();
    });
  });

  describe('Active Tool WA', () => {
    it('No selection changes', () => {
      // given
      const targetVerse = 'Paul, a servant of God and an apostle of Jesus Christ, for the faith of God\'s chosen people and the knowledge of the truth that agrees with godliness, ';
      const projectPath = path.join(FIXTURE_PROJECTS_PATH, 'en_tit');
      const initialState = getInitialStateData(bookId, projectPath, WORD_ALIGNMENT);
      initialState.selectionsReducer = selectionsReducer;
      const store = mockStore(initialState);
      const results = {};
      const expectedSelectionsChanged = false;

      // when
      store.dispatch(SelectionsActions.validateSelections(targetVerse, null, null, null, true, results));

      // then
      expect(results.selectionsChanged).toEqual(expectedSelectionsChanged);
      const actions = store.getActions();
      expect(actions.length).toEqual(0);
      expect(saveOtherContextSpy).toHaveBeenCalledTimes(0);
    });

    it('apostle selection edited', () => {
      // given
      const targetVerse = 'Paul, a servant of God and an apostl2 of Jesus Christ, for the faith of God\'s chosen people and the knowledge of the truth that agrees with godliness, ';
      const projectPath = path.join(FIXTURE_PROJECTS_PATH, 'en_tit');
      const initialState = getInitialStateData(bookId, projectPath, WORD_ALIGNMENT);
      const contextId = _.cloneDeep(initialState.contextIdReducer.contextId);
      contextId.tool = TRANSLATION_WORDS;
      const newSelection = {
        ...selectionsReducer,
        contextId,
      };
      const selectionsPath = path.join(projectPath, '.apps', 'translationCore', 'checkData', 'selections',
        contextId.reference.bookId,
        contextId.reference.chapter.toString(),
        contextId.reference.verse.toString());
      fs.ensureDirSync(selectionsPath);
      fs.outputJSONSync(path.join(selectionsPath, newSelection.modifiedTimestamp.replace(/[:"]/g, '_')) + '.json', newSelection);
      const store = mockStore(initialState);
      const results = {};
      const expectedSelectionsChanged = true;

      // when
      store.dispatch(SelectionsActions.validateSelections(targetVerse, null, null, null, true, results));

      // then
      expect(results.selectionsChanged).toEqual(expectedSelectionsChanged);
      const actions = store.getActions();
      expect(cleanOutDates(actions)).toMatchSnapshot();
      expect(saveOtherContextSpy).toHaveBeenCalledTimes(0);
    });
  });
});

describe('SelectionsActions.changeSelections', () => {
  const bookId = 'tit';
  const selectionsReducer = {
    'gatewayLanguageCode': 'en',
    'gatewayLanguageQuote': 'authority',
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
    saveOtherContextSpy = jest.spyOn(saveMethods, 'saveSelectionsForOtherContext');
  });

  afterEach(() => {
    if (saveOtherContextSpy) {
      saveOtherContextSpy.mockReset();
      saveOtherContextSpy.mockRestore();
    }
  });

  it('Set selection change', () => {
    // given
    const projectPath = path.join(FIXTURE_PROJECTS_PATH, 'en_tit');
    const initialState = getInitialStateData(bookId, projectPath);
    initialState.selectionsReducer = selectionsReducer;
    const store = mockStore(initialState);
    // when
    store.dispatch(SelectionsActions.changeSelections(selectionsReducer.selections));

    // then
    const actions = store.getActions();
    expect(cleanOutDates(actions)).toMatchSnapshot();
    expect(saveOtherContextSpy).toHaveBeenCalledTimes(0);
  });

  it('Set selection change on different contextId', () => {
    // given
    const projectPath = path.join(FIXTURE_PROJECTS_PATH, 'en_tit');
    const contextId = {
      reference: {
        bookId: bookId,
        chapter: 1,
        verse: 1,
      },
      groupId: 'authority',
    };
    const initialState = getInitialStateData(bookId, projectPath);
    initialState.selectionsReducer = selectionsReducer;
    const store = mockStore(initialState);
    // when
    store.dispatch(SelectionsActions.changeSelections(selectionsReducer.selections, false, contextId));

    // then
    const actions = store.getActions();
    expect(cleanOutDates(actions)).toMatchSnapshot();
    expect(saveOtherContextSpy).toHaveBeenCalledTimes(1);
  });
});

describe('SelectionsActions.showInvalidatedWarnings', () => {
  const bookId = 'tit';
  const alertsReducer = {
    props: [],
    ignored: [],
  };

  it('show selection invalid should succeed', () => {
    // given
    const projectPath = path.join(FIXTURE_PROJECTS_PATH, 'en_tit');
    const initialState = getInitialStateData(bookId, projectPath);
    initialState.alerts = alertsReducer;
    const store = mockStore(initialState);
    const showSelectionInvalidated = true;
    const showAlignmentsInvalidated = false;
    const expectedAction = {
      'type': 'OPEN_ALERT',
      'id': ALERT_SELECTIONS_INVALIDATED_ID,
      'message': ALERT_SELECTIONS_INVALIDATED_MSG,
    };

    // when
    store.dispatch(SelectionsActions.showInvalidatedWarnings(showSelectionInvalidated, showAlignmentsInvalidated));

    // then
    const actions = store.getActions();
    expect(actions.length).toEqual(1);
    verifyAlert(actions[0], expectedAction);
  });

  it('show selection invalid should succeed', () => {
    // given
    const projectPath = path.join(FIXTURE_PROJECTS_PATH, 'en_tit');
    const initialState = getInitialStateData(bookId, projectPath);
    initialState.alerts = alertsReducer;
    const store = mockStore(initialState);
    const showSelectionInvalidated = true;
    const showAlignmentsInvalidated = false;
    const expectedAction = {
      'type': 'OPEN_ALERT',
      'id': ALERT_SELECTIONS_INVALIDATED_ID,
      'message': ALERT_SELECTIONS_INVALIDATED_MSG,
    };

    // when
    store.dispatch(SelectionsActions.showInvalidatedWarnings(showSelectionInvalidated, showAlignmentsInvalidated));

    // then
    const actions = store.getActions();
    expect(actions.length).toEqual(1);
    verifyAlert(actions[0], expectedAction);
  });

  it('show alignment invalid should succeed', () => {
    // given
    const projectPath = path.join(FIXTURE_PROJECTS_PATH, 'en_tit');
    const initialState = getInitialStateData(bookId, projectPath);
    initialState.alerts = alertsReducer;
    const store = mockStore(initialState);
    const showSelectionInvalidated = false;
    const showAlignmentsInvalidated = true;
    const expectedAction = {
      'type': 'OPEN_ALERT',
      'id': ALERT_ALIGNMENTS_RESET_ID,
      'message': ALERT_ALIGNMENTS_RESET_MSG,
    };

    // when
    store.dispatch(SelectionsActions.showInvalidatedWarnings(showSelectionInvalidated, showAlignmentsInvalidated));

    // then
    const actions = store.getActions();
    expect(actions.length).toEqual(1);
    verifyAlert(actions[0], expectedAction);
  });

  it('show selection and alignment invalid should succeed', () => {
    // given
    const projectPath = path.join(FIXTURE_PROJECTS_PATH, 'en_tit');
    const initialState = getInitialStateData(bookId, projectPath);
    initialState.alerts = alertsReducer;
    const store = mockStore(initialState);
    const showSelectionInvalidated = true;
    const showAlignmentsInvalidated = true;
    const expectedAction = {
      'type': 'OPEN_ALERT',
      'id': ALERT_ALIGNMENTS_RESET_ID,
      'message': ALERT_ALIGNMENTS_AND_SELECTIONS_RESET_MSG,
    };

    // when
    store.dispatch(SelectionsActions.showInvalidatedWarnings(showSelectionInvalidated, showAlignmentsInvalidated));

    // then
    const actions = store.getActions();
    expect(actions.length).toEqual(1);
    verifyAlert(actions[0], expectedAction);
  });
});

//
// helpers
//

function verifyAlert(received, expected) {
  expect(received.type).toEqual(expected.type);
  expect(received.id).toEqual(expected.id);
  expect(received.message).toEqual(expected.message);
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

function getInitialStateData(bookId, projectPath, tool = TRANSLATION_WORDS) {
  const contextId = {
    reference: {
      bookId: bookId,
      chapter: 1,
      verse: 1,
    },
    groupId: 'apostle',
    quote: 'ἀποστόλων',
    occurrence: 1,
    tool,
  };
  const groupsDataReducer = fs.readJSONSync(path.join(projectPath, 'groupsDataReducer.json'));
  const groupsIndexReducer = fs.readJSONSync(path.join(projectPath, 'groupsIndexReducer.json'));

  const initialState = {
    actions: {},
    groupsDataReducer,
    groupsIndexReducer,
    toolsReducer: { selectedTool: tool },
    loginReducer: {
      loggedInUser: false,
      userdata: { username: 'dummy-test' },
    },
    projectDetailsReducer: {
      manifest: {
        project: { id: bookId },
        toolsSelectedGLs: { translationWords: 'en' },
      },
      projectSaveLocation: path.resolve(projectPath),
    },
    contextIdReducer: { contextId },
  };
  return initialState;
}

function initStoreData(projectPath, bookId) {
  const initialState = getInitialStateData(bookId, projectPath);
  return mockStore(initialState);
}
