import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import _ from 'lodash';
import * as actions from '../js/actions/ToolActions';
import { NT_ORIG_LANG_BIBLE, NT_ORIG_LANG } from '../js/common/BooksOfTheBible';
import {
  TRANSLATION_NOTES,
  TRANSLATION_WORDS,
  WORD_ALIGNMENT,
  ALERT_ALIGNMENTS_RESET_ID,
  ALERT_ALIGNMENTS_RESET_MSG,
  ALERT_SELECTIONS_INVALIDATED_ID,
  ALERT_SELECTIONS_INVALIDATED_MSG,
  ALERT_ALIGNMENTS_AND_SELECTIONS_RESET_MSG,
} from '../js/common/constants';
// constants
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
let mockInvalidCount = 0;

jest.mock('../js/selectors', () => ({
  ...require.requireActual('../js/selectors'),
  getTranslate: () => jest.fn((code) => code),
}));
jest.mock('../js/helpers/toolHelper', () => ({
  ...require.requireActual('../js/helpers/toolHelper'),
  getInvalidCountForTool: () => (mockInvalidCount),
}));

// verifyGroupDataMatchesWithFs: () => ({ type: 'VERIFY_GROUPS_DATA' })
jest.mock('../js/helpers/ResourcesHelpers', () => ({
  ...require.requireActual('../js/helpers/ResourcesHelpers'),
  loadProjectGroupData: () => ({
    'figs-abstractnouns': [{
      comments: false,
      selections: false,
      reminders: false,
      verseEdits: false,
      contextId: {
        glQuote: 'gl_uote',
        groupId: 'figs-abstractnouns',
        occurrence: 1,
        occurrenceNote: 'note',
        quote: 'quote',
        reference: {
          bookId: 'tit',
          chapter: 2,
          verse: 2,
        },
      },
    }],
  }),
  loadProjectGroupIndex: () => ([
    { id: 'figs-abstractnouns', name: 'Abstract Nouns' },
  ]),
}));

describe('Tool Actions.openTool', () => {
  const toolName = TRANSLATION_NOTES;
  const store = mockStore({
    projectDetailsReducer: {
      projectSaveLocation: 'Users/me/test_project_reg',
      manifest: {
        tsv_relation: [
          'en/ult',
          'el-x-koine/ugnt?v=0.8',
          'hbo/uhb?v=2.1.7',
        ],
        toolsSelectedGLs: { [toolName]: 'en' },
      },
    },
    resourcesReducer: {
      bibles: {
        'originalLanguage_Door43-Catalog': {
          [NT_ORIG_LANG_BIBLE]: {
            manifest: {
              language_id: NT_ORIG_LANG,
              resource_id: NT_ORIG_LANG_BIBLE,
              dublin_core: { version: 0.8 },
            },
          },
        },
      },
    },
  });

  it('should open a tool', () => {
    const expectedActions = [
      { 'type': 'SHOW_MODAL_CONTAINER', 'val': false },
      {
        'type': 'OPEN_ALERT_DIALOG', 'alertMessage': 'tools.loading_tool_data', 'loading': true,
      },
      { 'name': TRANSLATION_NOTES, 'type': 'OPEN_TOOL' },
      {
        'propertyName': 'tc_orig_lang_check_version_translationNotes',
        'type': 'ADD_MANIFEST_PROPERTY',
        'value': 0.8,
      },
      {
        'propertyName': 'tc_en_check_version_translationNotes',
        'type': 'ADD_MANIFEST_PROPERTY',
        'value': 'unknown',
      },
      {
        'type': 'BATCHING_REDUCER.BATCH',
        'meta': { 'batch': true },
        'payload': [
          { 'type': 'CLOSE_ALERT_DIALOG' },
          { 'boolean': false, 'type': 'TOGGLE_HOME_VIEW' },
        ],
      },
    ];
    return store.dispatch(actions.openTool(toolName)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });
});

describe('Tool Actions.warnOnInvalidations', () => {
  const initStore_ = {
    projectDetailsReducer: {
      projectSaveLocation: 'Users/me/test_project_reg',
      manifest: {
        tsv_relation: [
          'en/ult',
          'el-x-koine/ugnt?v=0.8',
          'hbo/uhb?v=2.1.7',
        ],
        toolsSelectedGLs: {
          [TRANSLATION_NOTES]: 'en',
          [TRANSLATION_WORDS]: 'en',
          [WORD_ALIGNMENT]: 'en',
        },
      },
    },
    resourcesReducer: {
      bibles: {
        originalLanguage: {
          [NT_ORIG_LANG_BIBLE]: {
            manifest: {
              language_id: NT_ORIG_LANG,
              resource_id: NT_ORIG_LANG_BIBLE,
              dublin_core: { version: 0.8 },
            },
          },
        },
      },
    },
    alerts: {
      props: [],
      ignored: [],
    },
  };

  describe('Tool translationNotes', () => {
    const toolName = TRANSLATION_NOTES;

    it('should show alert with no previous alert', () => {
      // given
      const store = mockStore(initStore_);
      mockInvalidCount = 1;
      const expectedAction = {
        'type': 'OPEN_ALERT',
        'id': ALERT_SELECTIONS_INVALIDATED_ID,
        'message': ALERT_SELECTIONS_INVALIDATED_MSG,
      };
      const expectedActionsCount = 1;

      // when
      store.dispatch(actions.warnOnInvalidations(toolName));

      // then
      const actions_ = store.getActions();
      expect(actions_.length).toEqual(expectedActionsCount);
      verifyAlert(actions_[0], expectedAction);
    });

    it('should not show alert with previous alert', () => {
      // given
      const initStore = _.cloneDeep(initStore_);

      initStore.alerts.props = [
        {
          'type': 'OPEN_ALERT',
          'id': ALERT_SELECTIONS_INVALIDATED_ID,
          'children': ALERT_SELECTIONS_INVALIDATED_MSG,
        },
      ];

      const store = mockStore(initStore);
      mockInvalidCount = 1;
      const expectedActionsCount = 0;

      // when
      store.dispatch(actions.warnOnInvalidations(toolName));

      // then
      const actions_ = store.getActions();
      expect(actions_.length).toEqual(expectedActionsCount);
    });

    it('should show alert with previous alert of different type', () => {
      // given
      const initStore = _.cloneDeep(initStore_);

      initStore.alerts.props = [
        {
          'type': 'OPEN_ALERT',
          'id': ALERT_ALIGNMENTS_RESET_ID,
          'children': ALERT_ALIGNMENTS_RESET_MSG,
        },
      ];

      const store = mockStore(initStore);
      mockInvalidCount = 1;
      const expectedAction = {
        'type': 'OPEN_ALERT',
        'id': ALERT_SELECTIONS_INVALIDATED_ID,
        'message': ALERT_SELECTIONS_INVALIDATED_MSG,
      };
      const expectedActionsCount = 1;

      // when
      store.dispatch(actions.warnOnInvalidations(toolName));

      // then
      const actions_ = store.getActions();
      expect(actions_.length).toEqual(expectedActionsCount);
      verifyAlert(actions_[0], expectedAction);
    });

    it('should not show alert with previous combined alert', () => {
      // given
      const initStore = _.cloneDeep(initStore_);

      initStore.alerts.props = [
        {
          'type': 'OPEN_ALERT',
          'id': ALERT_ALIGNMENTS_RESET_ID,
          'children': ALERT_ALIGNMENTS_AND_SELECTIONS_RESET_MSG,
        },
      ];

      const store = mockStore(initStore);
      mockInvalidCount = 1;
      const expectedActionsCount = 0;

      // when
      store.dispatch(actions.warnOnInvalidations(toolName));

      // then
      const actions_ = store.getActions();
      expect(actions_.length).toEqual(expectedActionsCount);
    });

    it('should not show alert with no previous alert and no invalidations', () => {
      // given
      const store = mockStore(initStore_);
      mockInvalidCount = 0;
      const expectedActionsCount = 0;

      // when
      store.dispatch(actions.warnOnInvalidations(toolName));

      // then
      const actions_ = store.getActions();
      expect(actions_.length).toEqual(expectedActionsCount);
    });
  });

  describe('Tool translationWords', () => {
    const toolName = TRANSLATION_WORDS;

    it('should show alert with no previous alert', () => {
      // given
      const store = mockStore(initStore_);
      mockInvalidCount = 1;
      const expectedAction = {
        'type': 'OPEN_ALERT',
        'id': ALERT_SELECTIONS_INVALIDATED_ID,
        'message': ALERT_SELECTIONS_INVALIDATED_MSG,
      };
      const expectedActionsCount = 1;

      // when
      store.dispatch(actions.warnOnInvalidations(toolName));

      // then
      const actions_ = store.getActions();
      expect(actions_.length).toEqual(expectedActionsCount);
      verifyAlert(actions_[0], expectedAction);
    });

    it('should not show alert with previous alert', () => {
      // given
      const initStore = _.cloneDeep(initStore_);

      initStore.alerts.props = [
        {
          'type': 'OPEN_ALERT',
          'id': ALERT_SELECTIONS_INVALIDATED_ID,
          'children': ALERT_SELECTIONS_INVALIDATED_MSG,
        },
      ];

      const store = mockStore(initStore);
      mockInvalidCount = 1;
      const expectedActionsCount = 0;

      // when
      store.dispatch(actions.warnOnInvalidations(toolName));

      // then
      const actions_ = store.getActions();
      expect(actions_.length).toEqual(expectedActionsCount);
    });

    it('should show alert with previous alert of different type', () => {
      // given
      const initStore = _.cloneDeep(initStore_);

      initStore.alerts.props = [
        {
          'type': 'OPEN_ALERT',
          'id': ALERT_ALIGNMENTS_RESET_ID,
          'children': ALERT_ALIGNMENTS_RESET_MSG,
        },
      ];

      const store = mockStore(initStore);
      mockInvalidCount = 1;
      const expectedAction = {
        'type': 'OPEN_ALERT',
        'id': ALERT_SELECTIONS_INVALIDATED_ID,
        'message': ALERT_SELECTIONS_INVALIDATED_MSG,
      };
      const expectedActionsCount = 1;

      // when
      store.dispatch(actions.warnOnInvalidations(toolName));

      // then
      const actions_ = store.getActions();
      expect(actions_.length).toEqual(expectedActionsCount);
      verifyAlert(actions_[0], expectedAction);
    });

    it('should not show alert with previous combined alert', () => {
      // given
      const initStore = _.cloneDeep(initStore_);

      initStore.alerts.props = [
        {
          'type': 'OPEN_ALERT',
          'id': ALERT_ALIGNMENTS_RESET_ID,
          'children': ALERT_ALIGNMENTS_AND_SELECTIONS_RESET_MSG,
        },
      ];

      const store = mockStore(initStore);
      mockInvalidCount = 1;
      const expectedActionsCount = 0;

      // when
      store.dispatch(actions.warnOnInvalidations(toolName));

      // then
      const actions_ = store.getActions();
      expect(actions_.length).toEqual(expectedActionsCount);
    });

    it('should not show alert with no previous alert and no invalidations', () => {
      // given
      const store = mockStore(initStore_);
      mockInvalidCount = 0;
      const expectedActionsCount = 0;

      // when
      store.dispatch(actions.warnOnInvalidations(toolName));

      // then
      const actions_ = store.getActions();
      expect(actions_.length).toEqual(expectedActionsCount);
    });
  });

  describe('Tool wordAlignment', () => {
    const toolName = WORD_ALIGNMENT;

    it('should show alert with no previous alert', () => {
      // given
      const store = mockStore(initStore_);
      mockInvalidCount = 1;
      const expectedAction = {
        'type': 'OPEN_ALERT',
        'id': ALERT_ALIGNMENTS_RESET_ID,
        'message': ALERT_ALIGNMENTS_RESET_MSG,
      };
      const expectedActionsCount = 1;

      // when
      store.dispatch(actions.warnOnInvalidations(toolName));

      // then
      const actions_ = store.getActions();
      expect(actions_.length).toEqual(expectedActionsCount);
      verifyAlert(actions_[0], expectedAction);
    });

    it('should not show alert with previous alert', () => {
      // given
      const initStore = _.cloneDeep(initStore_);

      initStore.alerts.props = [
        {
          'type': 'OPEN_ALERT',
          'id': ALERT_ALIGNMENTS_RESET_ID,
          'children': ALERT_ALIGNMENTS_RESET_MSG,
        },
      ];

      const store = mockStore(initStore);
      mockInvalidCount = 1;
      const expectedActionsCount = 0;

      // when
      store.dispatch(actions.warnOnInvalidations(toolName));

      // then
      const actions_ = store.getActions();
      expect(actions_.length).toEqual(expectedActionsCount);
    });

    it('should show alert with previous alert of different type', () => {
      // given
      const initStore = _.cloneDeep(initStore_);

      initStore.alerts.props = [
        {
          'type': 'OPEN_ALERT',
          'id': ALERT_SELECTIONS_INVALIDATED_ID,
          'children': ALERT_SELECTIONS_INVALIDATED_MSG,
        },
      ];

      const store = mockStore(initStore);
      mockInvalidCount = 1;
      const expectedAction = {
        'type': 'OPEN_ALERT',
        'id': ALERT_ALIGNMENTS_RESET_ID,
        'message': ALERT_ALIGNMENTS_RESET_MSG,
      };
      const expectedActionsCount = 1;

      // when
      store.dispatch(actions.warnOnInvalidations(toolName));

      // then
      const actions_ = store.getActions();
      expect(actions_.length).toEqual(expectedActionsCount);
      verifyAlert(actions_[0], expectedAction);
    });

    it('should not show alert with previous combined alert', () => {
      // given
      const initStore = _.cloneDeep(initStore_);

      initStore.alerts.props = [
        {
          'type': 'OPEN_ALERT',
          'id': ALERT_ALIGNMENTS_RESET_ID,
          'children': ALERT_ALIGNMENTS_AND_SELECTIONS_RESET_MSG,
        },
      ];

      const store = mockStore(initStore);
      mockInvalidCount = 1;
      const expectedActionsCount = 0;

      // when
      store.dispatch(actions.warnOnInvalidations(toolName));

      // then
      const actions_ = store.getActions();
      expect(actions_.length).toEqual(expectedActionsCount);
    });

    it('should not show alert with no previous alert and no invalidations', () => {
      // given
      const store = mockStore(initStore_);
      mockInvalidCount = 0;
      const expectedActionsCount = 0;

      // when
      store.dispatch(actions.warnOnInvalidations(toolName));

      // then
      const actions_ = store.getActions();
      expect(actions_.length).toEqual(expectedActionsCount);
    });
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
