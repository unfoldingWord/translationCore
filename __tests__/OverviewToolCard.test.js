/* eslint-env jest */
jest.unmock('fs-extra');
jest.unmock('adm-zip');
import React from 'react';
import consts from '../src/js/actions/ActionTypes';
import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';
import reducers from '../src/js/reducers';
import ToolCard from '../src/js/components/home/overview/ToolCard';
import renderer from 'react-test-renderer';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import * as LocalImportWorkflowActions from '../src/js/actions/Import/LocalImportWorkflowActions';
const project = '__tests__/fixtures/project/tstudio_project/abu_tit_text_reg.tstudio';

jest.mock('../src/js/components/home/toolsManagement/ToolCardProgress', () => 'ToolCardProgress');

describe('Tool Card component Tests', () => {
  let store;
  beforeEach(() => {
    // create a new store instance for each test
    store = createStore(
      reducers,
      applyMiddleware(thunk)
    );
  });
  it('ToolCard Before Project Loaded', () => {
    let state = {
      reducers: store.getState(),
      actions: {}
    };
    const component = renderer.create(
      <MuiThemeProvider>
        <ToolCard {...state} />
      </MuiThemeProvider>,
    );
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();


    store.dispatch({
      type: consts.UPDATE_SOURCE_PROJECT_PATH,
      sourceProjectPath: project
    });
    store.dispatch({
      type: consts.UPDATE_SELECTED_PROJECT_FILENAME,
      selectedProjectFilename: "abu_tit_text_reg"
    });

    store.dispatch(LocalImportWorkflowActions.localImport());

    tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('ToolCard After Project Loaded', () => {
    const title = 'Current Tool Title';
    const name = 'ToolName';
    const progress = 0.5;
    store.dispatch({
      type: consts.SET_CURRENT_TOOL_TITLE,
       currentToolTitle: title
    });
    store.dispatch({
      type: consts.SET_CURRENT_TOOL_NAME,
       currentToolName: name
    });
    store.dispatch({
      type: consts.SET_PROJECT_PROGRESS_FOR_TOOL,
      toolName: name,
      progress: progress
    });
    let state = {
      reducers: store.getState(),
      actions: {}
    };
    const component = renderer.create(
      <MuiThemeProvider>
        <ToolCard {...state} />
      </MuiThemeProvider>,
    );
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});