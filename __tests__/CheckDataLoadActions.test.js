/* eslint-env jest */
//action consts
import path from 'path-extra';
// Mock store set up
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import fs from 'fs-extra';
import { TRANSLATION_WORDS } from '../src/js/common/constants';

//actions
import * as CheckDataLoadActions from '../src/js/actions/CheckDataLoadActions';
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('../src/js/helpers/gatewayLanguageHelpers', () => ({
  getGatewayLanguageCodeAndQuote: () => ({
    gatewayLanguageCode: 'en',
    gatewayLanguageQuote: 'authority',
  }),
}));

const projectSaveLocation = path.join(__dirname, 'fixtures/project/checkDataProject');
const toolsReducer = { selectedTool: TRANSLATION_WORDS };
const groupsIndexReducer = {
  groupsIndex: [
    {
      id: 'apostle',
      name: 'apostle, apostles, apostleship',
    },
    {
      id: 'authority',
      name: 'authority, authorities',
    },
    {
      id: 'figs_metaphor',
      name: 'metaphor',
    },
  ],
};
const projectDetailsReducer = {
  projectSaveLocation,
  'manifest': {
    'target_language': {
      'id': 'sw',
      'name': 'Kiswahili',
      'direction': 'ltr',
    },
    'project': {
      'id': 'tit',
      'name': 'Titus',
    },
    'toolsSelectedGLs': { translationWords: 'en' },
  },
  'currentProjectToolsProgress': {
    'wordAlignment': 0,
    'translationWords': 0.21,
  },
};
const contextIdReducer = {
  'contextId': {
    'groupId': 'figs_metaphor',
    'occurrence': 1,
    'quote': 'that he put before them',
    'information': 'Paul speaks about good deeds as if they were objects that God could place in front of people. AT: "that God prepared for them to do" (See: [[:en:ta:vol1:translate:figs_metaphor]]) \n',
    'reference': {
      'bookId': 'tit',
      'chapter': 3,
      'verse': 8,
    },
    'tool': 'TranslationNotesChecker',
  },
  'before': 'Huu ni ujumbe wa kuaminika. Ninawataka myanene kwa ujasiri mambo haya , ili kwamba wale wanaomwamini Mungu wawe na dhamira juu ya kazi nzuri ambayo aliiweka mbele yao. Mambo haya ni mazuri na yanafaida kwa ajili ya watu wote.',
  'after': 'Huu ni ujumbe wa kuaminika. Ninawataka myanene kwa ujasiri mambo haya , ili kwamba wale wanaomwamini Mungu wawe na dhamira juu ya kazi nzuri ambayo aliiweka mbele yao. Mambo haya ni mazuri na yanafaida kwa ajili ya watu wote. TEST',
  'tags': [
    'punctuation',
    'wordChoice',
  ],
  'modifiedTimestamp': '2017-04-28T14:27:50.848Z',
};

describe('CheckDataLoadActions.generateLoadPath', () => {
  beforeEach(()=>{
    fs.__loadDirIntoMockFs(projectSaveLocation, projectSaveLocation);
  });

  it('should generate the output directory for the comments data', () => {
    const checkDataName = 'comments';

    expect(CheckDataLoadActions.generateLoadPath(projectDetailsReducer, contextIdReducer, checkDataName))
      .toEqual(path.join(`${projectSaveLocation}/.apps/translationCore/checkData/${checkDataName}/tit/3/8`));
  });

  it('runs CheckDataLoadActions.loadCheckData', () => {
    const checkDataName = 'verseEdits';
    let loadPath = CheckDataLoadActions.generateLoadPath(projectDetailsReducer, contextIdReducer, checkDataName);
    let checkData = CheckDataLoadActions.loadCheckData(loadPath, contextIdReducer.contextId);

    expect(checkData).toEqual(expect.objectContaining({
      contextId: expect.objectContaining({
        groupId: 'figs_metaphor',
        quote: 'that he put before them',
        tool: 'TranslationNotesChecker',
      }),
    }));
  });

  it('runs CheckDataLoadActions.loadComments', () => {
    const expectedAction = {
        type: 'ADD_COMMENT',
        modifiedTimestamp: '',
        text: '',
        userName: ''
      };
    const store = mockStore({
      projectDetailsReducer,
      contextIdReducer,
    });

    const results = CheckDataLoadActions.loadComments(store.getState());
    expect(results).toEqual(expectedAction);
  });

  it('runs CheckDataLoadActions.loadSelections', () => {
    const expectedAction = {"type":"CHANGE_SELECTIONS","modifiedTimestamp":"2017-04-25T18:10:38.511Z","selections":[{"text":"ambayo","occurrence":1,"occurrences":1},{"text":"aliiweka","occurrence":1,"occurrences":1},{"text":"mbele","occurrence":1,"occurrences":1},{"text":"yao","occurrence":1,"occurrences":1}]};
    const store = mockStore({
      projectDetailsReducer,
      contextIdReducer,
    });

    const results = CheckDataLoadActions.loadSelections(store.getState());
    expect(results).toEqual(expectedAction);
  });

  it('runs CheckDataLoadActions.loadReminders: should not load another tools data', () => {
    const expectedAction = {
        type: 'SET_REMINDER',
        enabled: false,
        modifiedTimestamp: '',
        userName: '',
        gatewayLanguageCode: null,
        gatewayLanguageQuote: null
      };
    const store = mockStore({
      groupsIndexReducer,
      toolsReducer,
      projectDetailsReducer,
      contextIdReducer,
    });
    const results = CheckDataLoadActions.loadReminders(store.getState());
    expect(results).toEqual(expectedAction);
  });
});
