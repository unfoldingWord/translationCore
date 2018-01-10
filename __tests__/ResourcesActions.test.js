import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as ResourcesActions from '../src/js/actions/ResourcesActions';
jest.unmock('fs-extra');
import path from 'path-extra';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('ResourcesActions', () => {
  it('loadBiblesChapter() gal', () => {
    const bookId = 'gal';
    const expectedFirstWord = {
      "text": "Παῦλος",
      "tag": "w",
      "type": "word",
      "lemma": "Παῦλος",
      "strong": "G39720",
      "morph": "Gr,N,,,,,NMS,",
      "tw": "rc://*/tw/dict/bible/names/paul"
    };
    const expectedResources = ['udb', 'ulb', 'ugnt', 'targetLanguage'];
    let projectPath = path.join(".","__tests__","fixtures","project","en_gal");
    const store = mockStore({
      actions: {},
      toolsReducer: {
        currentToolName: 'wordAlignment'
      },
      projectDetailsReducer: {
        manifest: {
          project: {
            id: bookId
          }
        },
        projectSaveLocation: path.resolve(projectPath)
      },
      resourcesReducer: {
        bibles: {},
        translationHelps: {},
        lexicons: {}
      }
    });
    const contextId = {
      reference: {
        bookId: bookId,
        chapter: 1
      }
    };
    store.dispatch(
      ResourcesActions.loadBiblesChapter(contextId)
    );
    const actions = store.getActions();
    let ugntAction = validateExpectedResourcesAndGetUgntAction(actions, expectedResources);
    expect(ugntAction).not.toBeNull();
    const firstCh = ugntAction.bibleData[1];
    const firstVs = firstCh[1];
    const firstWd = firstVs[0];
    expect(firstWd).toEqual(expectedFirstWord);
  });
});

//
// helpers
//

function validateExpectedResourcesAndGetUgntAction(actions, expectedResources) {
  let ugntAction = null;
  expect(actions).not.toBeNull();
  for (let expectedResource of expectedResources) {
    let found = false;
    for (let action of actions) {
      if (action.bibleName === expectedResource) {
        if (action.bibleName === 'ugnt') {
          ugntAction = action;
        }
        found = true;
        break;
      }
    }
    expect(found).toBeTruthy();
  }
  return ugntAction;
}

