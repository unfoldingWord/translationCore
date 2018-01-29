/* eslint-env jest */
jest.unmock('fs-extra');
jest.unmock('adm-zip');
import React from 'react';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import ToolCard from '../src/js/components/home/overview/ToolCard';
import * as ProjectDetailsActions from '../src/js/actions/ProjectDetailsActions';
import renderer from 'react-test-renderer';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import * as LocalImportWorkflowActions from '../src/js/actions/Import/LocalImportWorkflowActions';
const project = '__tests__/fixtures/project/tstudio_project/abu_tit_text_reg.tstudio';
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('../src/js/components/home/toolsManagement/ToolCardProgress', () => 'ToolCardProgress');

describe('Tool Card component Tests', () => {
  let store;
  beforeEach(() => {
    // create a new store instance for each test
    store = mockStore({
      localImportReducer: {
        selectedProjectFilename: "abu_tit_text_reg",
        sourceProjectPath: project
      },
      settingsReducer: {
        developerMode: ''
      },
      projectDetailsReducer: {
        manifest: {
          project: {
            id: 'tit'
          },
          target_language: {
            id: 'abu'
          },
          'resource': {
            id: 'reg'
          }
        }
      }
    });
  });

  it('ToolCard Before Project Loaded', () => {
    const props = {
      reducers: {
        toolsReducer: {
          currentToolTitle: '',
          currentToolName: ''
        },
        projectDetailsReducer: {
          currentProjectToolsProgress: '',
          projectSaveLocation: ''
        }
      },
      actions: {}
    };
    const component = renderer.create(
      <MuiThemeProvider>
        <ToolCard {...props} />
      </MuiThemeProvider>,
    );
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();

    store.dispatch(LocalImportWorkflowActions.localImport());

    tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('ToolCard After Project Loaded', () => {
    const title = 'Current Tool Title';
    const name = 'ToolName';
    const progress = 0.5;
    const props = {
      reducers: {
        toolsReducer: {
          currentToolTitle: title,
          currentToolName: name
        },
        projectDetailsReducer: {
          currentProjectToolsProgress: {
            [name]: progress
          }
        }
      },
      actions: {
        getProjectProgressForTools: (toolName) => {
          ProjectDetailsActions.getProjectProgressForTools(toolName);
        }
      }
    };
    const component = renderer.create(
      <MuiThemeProvider>
        <ToolCard {...props} />
      </MuiThemeProvider>,
    );
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});