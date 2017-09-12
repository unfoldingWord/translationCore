import { createStore, applyMiddleware } from 'redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as ProjectSelctionActions from '../src/js/actions/ProjectSelectionActions';
import * as ImportLocalActions from '../src/js/actions/ImportLocalActions';
import * as ProjectDetailsActions from '../src/js/actions/projectDetailsActions';

import * as usfmHelpers from '../src/js/helpers/usfmHelpers';
import * as types from '../src/js/actions/ActionTypes';
import { expect } from 'chai';
import reducers from '../src/js/reducers';

const noMergeConflictsProjectPath = window.__base + 'test/fixtures/project/mergeConflicts/no_merge_conflicts_project';
const validUSFMProject = window.__base + 'test/fixtures/usfm/valid/cdh_tit_text_reg.usfm';

describe('Import/Select project manifest generation', () => {
  let store;
  beforeEach(() => {
    // create a new store instance for each test
    store = createStore(
      reducers,
      applyMiddleware(thunk)
    )
  })
  it('should select a project and import a valid manifest to the store', (done) => {
    store.dispatch(ProjectSelctionActions.selectProject(noMergeConflictsProjectPath))
    const { manifest } = store.getState().projectDetailsReducer
    expect(manifest.target_language).to.deep.equal({ "id": 'ha', "name": '(Hausa) هَوُسَ', direction: 'ltr' });
    expect(manifest.project).to.deep.equal({ id: 'tit', name: 'Titus' });
    expect(manifest.source_translations[0]).to.include(
      {
        language_id: 'en',
        resource_id: 'ulb',
        checking_level: '3',
        version: '9'
      }
    );
    expect(manifest.tcInitialized).to.be.true;
    done()
  })

  it('should select a usfm project and import a valid manifest to the store', (done) => {
    store.dispatch(ProjectDetailsActions.setProjectType('usfm'));
    const { homeFolderPath } = usfmHelpers.setUpUSFMFolderPath(validUSFMProject);
    store.dispatch(ProjectSelctionActions.selectProject(homeFolderPath))
    const { manifest } = store.getState().projectDetailsReducer
    expect(manifest.target_language).to.deep.equal({ id: 'cdh', name: 'Chambeali', direction: 'ltr' });
    expect(manifest.project).to.deep.equal({ id: 'tit', name: 'Titus' });
    expect(manifest.source_translations[0]).to.include(
      {
        language_id: 'en',
        resource_id: 'ulb',
        checking_level: '',
        version: ''
      });
    expect(manifest.tcInitialized).to.be.true;
    done()
  })
})