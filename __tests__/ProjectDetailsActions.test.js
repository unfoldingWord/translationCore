/* eslint-env jest */

import types from '../src/js/actions/ActionTypes';
import * as actions from '../src/js/actions/ProjectDetailsActions';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import fs from 'fs-extra';
import path from 'path-extra';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

it('creates an action to update contributors', () => {
  const store = mockStore({});
  const expectedActions = [{
    type: types.SET_SAVE_PATH_LOCATION,
    pathLocation: 'some/path'
  }];
  store.dispatch(actions.setSaveLocation('some/path'));
  const receivedActions = store.getActions();
  expect(receivedActions).toEqual(expectedActions);
});

it('creates an action to reset the project details', () => {
  const expectedAction = {
    type: types.RESET_PROJECT_DETAIL
  };
  expect(actions.resetProjectDetail())
    .toEqual(expectedAction);
});

describe('should create an action to get the project progress for tools', () => {
  // NOTE: we don't need to test the actual progress checking here.
  // progress checking can be tested on it's own.
  const initialState = {
    projectDetailsReducer: {
      projectSaveLocation: '../',
      manifest: {
        project: {
          id: ''
        }
      }
    }
  };
  fs.__setMockFS({
    [path.join(path.homedir(), 'translationCore/resources/grc/bibles/ugnt/v13Beta/index.json')]: {}
  });

  it('should fail if no toolName is given', () => {
    const store = mockStore(initialState);
    return expect(store.dispatch(actions.getProjectProgressForTools())).rejects.toEqual('Expected "toolName" to be a string but received undefined instead');
  });

  it('should give progress for word alignment', () => {
    const store = mockStore(initialState);
    const expectedActions = [
      {"progress": 0, "toolName": "wordAlignment", "type": "SET_PROJECT_PROGRESS_FOR_TOOL"}
    ];
    store.dispatch(actions.getProjectProgressForTools('wordAlignment'));
    const receivedActions = store.getActions();
    expect(receivedActions).toEqual(expectedActions);
  });

  it('should give progress for a tool', () => {
    const store = mockStore(initialState);
    const expectedActions = [
      {"progress": 0, "toolName": "myTool", "type": "SET_PROJECT_PROGRESS_FOR_TOOL"}
    ];
    store.dispatch(actions.getProjectProgressForTools('myTool'));
    const receivedActions = store.getActions();
    expect(receivedActions).toEqual(expectedActions);
  });
});

it('creates an action to set the project manifest', () => {
  const expectedAction = {
    type: types.STORE_MANIFEST,
    manifest: { hello: 'world' }
  };
  expect(actions.setProjectManifest({ hello: 'world' }))
    .toEqual(expectedAction);
});

it('creates an action to add an object property to the manifest', () => {
  const expectedAction = {
    type: types.ADD_MANIFEST_PROPERTY,
    propertyName: 'key',
    value: { hello: 'world' }
  };
  expect(actions.addObjectPropertyToManifest('key', { hello: 'world' }))
    .toEqual(expectedAction);
});

it('creates an action to set the project book id and name', () => {
  const store = mockStore({
    projectInformationCheckReducer: {
      bookId: 'gen'
    }
  });
  const expectedActions = [{
    type: types.SAVE_BOOK_ID_AND_BOOK_NAME_IN_MANIFEST,
    bookId: 'gen',
    bookName: 'Genesis'
  }];
  store.dispatch(actions.setProjectBookIdAndBookName());
  const receivedActions = store.getActions();
  expect(receivedActions).toEqual(expectedActions);
});

it('creates an action to set the language details',  () => {
  const store = mockStore({
    projectInformationCheckReducer: {
      languageDirection: 'rtl',
      languageId: 'en',
      languageName: 'English'
    }
  });
  const expectedActions = [{
    type: types.SAVE_LANGUAGE_DETAILS_IN_MANIFEST,
    languageDirection: 'rtl',
    languageId: 'en',
    languageName: 'English'
  }];
  store.dispatch(actions.setLanguageDetails());
  const receivedActions = store.getActions();
  expect(receivedActions).toEqual(expectedActions);
});

it('creates an action to update contributors', () => {
  const store = mockStore({
    projectInformationCheckReducer: {
      contributors: ['jon', 'steve']
    }
  });
  const expectedActions = [{
    type: types.SAVE_TRANSLATORS_LIST_IN_MANIFEST,
    translators: ['jon', 'steve']
  }];
  store.dispatch(actions.updateContributors());
  const receivedActions = store.getActions();
  expect(receivedActions).toEqual(expectedActions);
});

it('creates an action to update checkers', () => {
  const store = mockStore({
    projectInformationCheckReducer: {
      checkers: ['jon', 'steve']
    }
  });
  const expectedActions = [{
    type: types.SAVE_CHECKERS_LIST_IN_MANIFEST,
    checkers: ['jon', 'steve']
  }];
  store.dispatch(actions.updateCheckers());
  const receivedActions = store.getActions();
  expect(receivedActions).toEqual(expectedActions);
});
