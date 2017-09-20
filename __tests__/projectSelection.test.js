/* eslint-env jest */

import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import * as ProjectSelctionActions from '../src/js/actions/ProjectSelectionActions';
import * as ProjectDetailsActions from '../src/js/actions/ProjectDetailsActions';

import * as usfmHelpers from '../src/js/helpers/usfmHelpers';
import { expect } from 'chai';
import reducers from '../src/js/reducers';

const noMergeConflictsProjectPath = '__tests__/fixtures/project/mergeConflicts/no_merge_conflicts_project';
const validUSFMProject = '__tests__/fixtures/usfm/valid/cdh_tit_text_reg.usfm';

describe('Import/Select project manifest generation', () => {
  let store;
  beforeEach(() => {
    // create a new store instance for each test
    store = createStore(
      reducers,
      applyMiddleware(thunk)
    )
  });

  test('should select a project and import a valid manifest to the store', () => {
    store.dispatch(ProjectSelctionActions.selectProject(noMergeConflictsProjectPath));
    const { manifest } = store.getState().projectDetailsReducer;
    expect(manifest.target_language).toEqual({ "id": 'ha', "name": '(Hausa) هَوُسَ', direction: 'ltr' });
    expect(manifest.project).toEqual({ id: 'tit', name: 'Titus' });
    expect(manifest.source_translations[0]).toContain(
      {
        language_id: 'en',
        resource_id: 'ulb',
        checking_level: '3',
        version: '9'
      }
    );
    expect(manifest.tcInitialized).toBeTruthy();
  });

  test('should select a usfm project and import a valid manifest to the store', () => {
    store.dispatch(ProjectDetailsActions.setProjectType('usfm'));
    const { homeFolderPath } = usfmHelpers.setUpUSFMFolderPath(validUSFMProject);
    store.dispatch(ProjectSelctionActions.selectProject(homeFolderPath));
    const { manifest } = store.getState().projectDetailsReducer;
    expect(manifest.target_language).toEqual({ id: 'cdh', name: 'Chambeali', direction: 'ltr' });
    expect(manifest.project).toEqual({id: 'tit', name: 'Titus'});
    expect(manifest.source_translations[0]).toContain(
      {
        language_id: 'en',
        resource_id: 'ulb',
        checking_level: '',
        version: ''
      });
    expect(manifest.tcInitialized).toBeTruthy();
  });
});