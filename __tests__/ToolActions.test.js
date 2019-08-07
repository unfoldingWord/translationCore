import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as actions from '../src/js/actions/ToolActions';
import { NT_ORIG_LANG_BIBLE, NT_ORIG_LANG } from '../src/js/common/BooksOfTheBible';
import { TRANSLATION_NOTES } from '../src/js/common/constants';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('../src/js/selectors', () => ({
  ...require.requireActual('../src/js/selectors'),
  getTranslate: () => {
    return jest.fn((code) => {
      return code;
    });
  }
}));
jest.mock('../src/js/actions/GroupsDataActions', () => ({
  verifyGroupDataMatchesWithFs: () => ({type: 'VERIFY_GROUPS_DATA'})
}));

jest.mock('../src/js/actions/ContextIdActions', () => ({
  loadCurrentContextId: () => ({type: 'LOAD_CURRENT_CONTEXT_ID'})
}));

jest.mock('../src/js/helpers/ResourcesHelpers', () => ({
  loadProjectGroupData: () => ({
    "figs-abstractnouns": [{
      comments: false,
      selections: false,
      reminders: false,
      verseEdits: false,
      contextId: {
        glQuote: "gl_uote",
        groupId: "figs-abstractnouns",
        occurrence: 1,
        occurrenceNote: "note",
        quote: "quote",
        reference: {
          bookId: "tit",
          chapter: 2,
          verse: 2
        }
      }
    }]
  }),
  loadProjectGroupIndex: () => ([
    {id: "figs-abstractnouns", name: "Abstract Nouns"}
  ])
}));

describe('Tool Actions.openTool', () => {
  const toolName = TRANSLATION_NOTES;
  const store = mockStore({
    projectDetailsReducer: {
      projectSaveLocation: 'Users/me/test_project_reg',
      manifest: {
        tsv_relation: [
          "en/ult",
          "el-x-koine/ugnt?v=0.8",
          "hbo/uhb?v=2.1.7"
        ],
        toolsSelectedGLs: {
          [toolName]: 'en'
        },
      }
    },
    resourcesReducer: {
      bibles: {
        originalLanguage: {
          [NT_ORIG_LANG_BIBLE]: {
            manifest: {
              language_id: NT_ORIG_LANG,
              resource_id: NT_ORIG_LANG_BIBLE,
              dublin_core: { version: 0.8 },
            }
          }
        }
      }
    }
  });
  it('should open a tool', () => {
    const expectedActions = [
      {"type": "SHOW_MODAL_CONTAINER", "val": false},
      {"type": "OPEN_ALERT_DIALOG", alertMessage: "tools.loading_tool_data", loading: true },
      {
        "type": "BATCHING_REDUCER.BATCH",
        "meta": { "batch": true },
        "payload": [
          {"type": "CLEAR_PREVIOUS_GROUPS_DATA"},
          {"type": "CLEAR_PREVIOUS_GROUPS_INDEX"},
          {"type": "CLEAR_CONTEXT_ID"},
          {"name": TRANSLATION_NOTES, "type": "OPEN_TOOL"},
        ]
      },
      {"allGroupsData": {"figs-abstractnouns": [{"comments": false, "contextId": {"glQuote": "gl_uote", "groupId": "figs-abstractnouns", "occurrence": 1, "occurrenceNote": "note", "quote": "quote", "reference": {"bookId": "tit", "chapter": 2, "verse": 2}}, "reminders": false, "selections": false, "verseEdits": false}]}, "type": "LOAD_GROUPS_DATA_FROM_FS"},
      {"groupsIndex": [{"id": "figs-abstractnouns", "name": "Abstract Nouns"}], "type": "LOAD_GROUPS_INDEX"},
      {"type": 'LOAD_CURRENT_CONTEXT_ID'},
      {"type": 'VERIFY_GROUPS_DATA'},
      {
        "type": "BATCHING_REDUCER.BATCH",
        "meta": { "batch": true },
        "payload": [
          {"type": 'CLOSE_ALERT_DIALOG' },
          {"boolean": false, "type": "TOGGLE_HOME_VIEW"}
        ]
      },
    ];
    return store.dispatch(actions.openTool(toolName)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });
});
