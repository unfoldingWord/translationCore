import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import path from 'path';
import * as actions from '../src/js/actions/TargetLanguageActions';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('loadTargetLanguageChapter', () => {
  const manifest = {
    "generator": {
      "name": "ts-desktop",
      "build": "132"
    },
    "target_language": {
      "id": "ha",
      "name": "(Hausa) هَوُسَ",
      "direction": "ltr"
    },
    "project": {
      "id": "tit",
      "name": "Titus"
    },
    "type": {
      "id": "text",
      "name": "Text"
    },
    "source_translations": [
      {
        "language_id": "en",
        "resource_id": "ulb",
        "checking_level": "3",
        "date_modified": 20170329,
        "version": "9"
      }
    ],
    "translators": [
      "Philip",
      "paul",
      "Hannatu",
      "Ora Bible Project 2"
    ],
    "checkers": [
      "RoyalSix"
    ],
    "time_created": "2017-09-11T22:02:31.737Z",
    "tools": [],
    "repo": "",
    "tcInitialized": true,
    "package_version": 7,
    "format": "usfm",
    "resource": {
      "id": "ulb",
      "name": "Unlocked Literal Bible"
    },
    "parent_draft": {},
    "finished_chunks": [
      "front-title",
      "01-title",
      "01-01",
      "03-15"
    ]
  };

  it('loads a Bible chapter for a target language', () => {
    const expectedActions = [{
      type: 'ADD_NEW_BIBLE_TO_RESOURCES',
      bibleName: 'targetLanguage',
      bibleData: {
        '1': {
          "1": "In the beginning...",
          "2": "When he began to create the earth..."
        },
        'manifest': manifest
      }
    }];
    const initialState = {
      projectDetailsReducer: {
        manifest: {
          project: {
            id: 'normal_project'
          }
        },
        projectSaveLocation: path.join(__dirname, 'fixtures/project/manifest')
      }
    };
    const store = mockStore(initialState);
    store.dispatch(actions.loadTargetLanguageChapter('1'));

    expect(store.getActions()).toEqual(expectedActions);
  });

  it('fails to load from missing project', () => {
    const expectedActions = [];
    const initialState = {
      projectDetailsReducer: {
        manifest: {
          project: {
            id: 'missing_project'
          }
        },
        projectSaveLocation: path.join(__dirname, 'fixtures/project/manifest')
      }
    };
    const store = mockStore(initialState);
    store.dispatch(actions.loadTargetLanguageChapter('1'));

    expect(store.getActions()).toEqual(expectedActions);
  });

  it('fails to load missing chapter', () => {
    // TODO: should the action instead not be dispatched?
    const expectedActions = [{
      type: 'ADD_NEW_BIBLE_TO_RESOURCES',
      bibleName: 'targetLanguage',
      bibleData: {
        '9': undefined,
        'manifest': manifest
      }
    }];
    const initialState = {
      projectDetailsReducer: {
        manifest: {
          project: {
            id: 'normal_project'
          }
        },
        projectSaveLocation: path.join(__dirname, 'fixtures/project/manifest')
      }
    };
    const store = mockStore(initialState);
    store.dispatch(actions.loadTargetLanguageChapter('9'));

    expect(store.getActions()).toEqual(expectedActions);
  });

  it('fails to load missing manifest', () => {
    const expectedActions = [];
    const initialState = {
      projectDetailsReducer: {
        manifest: {
          project: {
            id: 'missing_manifest'
          }
        },
        projectSaveLocation: path.join(__dirname, 'fixtures/project/manifest')
      }
    };
    const store = mockStore(initialState);
    store.dispatch(actions.loadTargetLanguageChapter('1'));

    expect(store.getActions()).toEqual(expectedActions);
  });
});