import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as actions from '../src/js/actions/ToolActions';
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
  const toolName = 'translationNotes';
  const store = mockStore({
    projectDetailsReducer: {
      projectSaveLocation: 'Users/me/test_project_reg',
      currentProjectToolsSelectedGL: {
        [toolName]: 'en'
      }
    }
  });
  it('should open a tool', () => {
    const expectedActions = [
      {"type": "SHOW_MODAL_CONTAINER", "val": false},
      {"type": "START_LOADING"},
      {"type": "CLEAR_PREVIOUS_GROUPS_DATA"},
      {"type": "CLEAR_PREVIOUS_GROUPS_INDEX"},
      {"type": "CLEAR_CONTEXT_ID"},
      {"name": "translationNotes", "type": "OPEN_TOOL"},
      {"allGroupsData": {"figs-abstractnouns": [{"comments": false, "contextId": {"glQuote": "gl_uote", "groupId": "figs-abstractnouns", "occurrence": 1, "occurrenceNote": "note", "quote": "quote", "reference": {"bookId": "tit", "chapter": 2, "verse": 2}}, "reminders": false, "selections": false, "verseEdits": false}]}, "type": "LOAD_GROUPS_DATA_FROM_FS"},
      {"groupsIndex": [{"id": "figs-abstractnouns", "name": "Abstract Nouns"}], "type": "LOAD_GROUPS_INDEX"},
      {"type": 'VERIFY_GROUPS_DATA'},
      {"type": 'LOAD_CURRENT_CONTEXT_ID'},
      {"type": 'VERIFY_GROUPS_DATA'},
      {"show": false, "type": 'TOGGLE_LOADER_MODAL'},
      {"boolean": false, "type": "TOGGLE_HOME_VIEW"}
    ];
    return store.dispatch(actions.openTool(toolName)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });
});