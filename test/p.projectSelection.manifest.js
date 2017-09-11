import { createStore, applyMiddleware } from 'redux'
import configureStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import * as ProjectSelctionActions from '../src/js/actions/ProjectSelectionActions';
import * as types from '../src/js/actions/ActionTypes';
import { expect } from 'chai';
import reducers from '../src/js/reducers';
const middlewares = [thunk]

const noMergeConflictsProjectPath = window.__base + 'test/fixtures/project/mergeConflicts/no_merge_conflicts_project';

describe('should make valid manifest after project selection', () => {
  let store;
  beforeEach(() => {
    // create a new store instance for each test
    store = createStore(
      reducers,
      applyMiddleware(thunk)
    )
  })
  it('selects a project', () => {
    store.dispatch(ProjectSelctionActions.selectProject(noMergeConflictsProjectPath))
    const {manifest} = store.getState().projectDetailsReducer
    expect(manifest.target_language).to.deep.equal({ "id": 'ha', "name": '(Hausa) هَوُسَ', direction: 'ltr' });
    expect(manifest.project).to.deep.equal({ id: 'tit', name: 'Titus' });
    expect(manifest.source_translations).to.deep.equal(
      [{
        language_id: 'en',
        resource_id: 'ulb',
        checking_level: '3',
        date_modified: 20170329,
        version: '9'
      }]);
    expect(manifest.tcInitialized).to.be.true;
  })
})