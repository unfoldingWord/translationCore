/* eslint-env jest */
//action consts
import consts from '../src/js/actions/ActionTypes';
import path from 'path-extra';
// Mock store set up
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
//actions
import * as CheckDataLoadActions from '../src/js/actions/CheckDataLoadActions';
const projectSaveLocation = '__tests__/fixtures/project/checkDataProject';
const projectDetailsReducer = {
  projectSaveLocation,
  "manifest": {
    "target_language": {
      "id": "sw",
      "name": "Kiswahili",
      "direction": "ltr"
    },
    "project": {
      "id": "tit",
      "name": "Titus"
    }
  },
  "currentProjectToolsProgress": {
    "wordAlignment": 0,
    "translationWords": 0.21
  }
};
const contextIdReducer = {
  "contextId": {
    "reference": {
      "bookId": "tit",
      "chapter": 2,
      "verse": 4
    },
    "tool": "translationWords",
    "groupId": "children",
    "quote": "children",
    "occurrence": 1
  }
};
describe('CheckDataLoadActions.generateLoadPath', () => {
  it('should generate the output directory for the comments data', () => {
    const checkDataName = "comments";
    expect(CheckDataLoadActions.generateLoadPath(projectDetailsReducer, contextIdReducer, checkDataName))
      .toEqual(path.join(`${projectSaveLocation}/.apps/translationCore/checkData/${checkDataName}/tit/2/4`));
  });
});

describe('CheckDataLoadActions.loadCheckData', () => {
  it('', () => {
    const checkDataName = "verseEdits";
    let loadPath = CheckDataLoadActions.generateLoadPath(projectDetailsReducer, contextIdReducer, checkDataName);
    console.log(CheckDataLoadActions.loadCheckData(loadPath, contextIdReducer));
  });
});

// describe('CheckDataLoadActions.loadComments', () => {
//   it('', () => {

//   });
// });

// describe('CheckDataLoadActions.loadSelections', () => {
//   it('', () => {

//   });
// });

// describe('CheckDataLoadActions.loadVerseEdit', () => {
//   it('', () => {

//   });
// });