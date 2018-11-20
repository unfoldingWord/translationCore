/* eslint-env jest */
import React from 'react';
import ToolCard from '../src/js/components/home/toolsManagement/ToolCard';
import { DEFAULT_GATEWAY_LANGUAGE } from '../src/js/helpers/gatewayLanguageHelpers';
import renderer from 'react-test-renderer';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { shallow } from 'enzyme';
import fs from "../__mocks__/fs-extra";
import path from "path-extra";
import {USER_RESOURCES_PATH} from "../src/js/helpers/ResourcesHelpers";

jest.mock('../src/js/components/home/toolsManagement/ToolCardProgress', () => 'ToolCardProgress');
jest.mock('../src/js/components/home/toolsManagement/GlDropDownList', () => 'GlDropDownList');
jest.mock('material-ui/Checkbox');

// Tests for ToolCard React Component
describe('Test ToolCard component',()=>{
  beforeAll(() => {
    // reset mock filesystem data
    fs.__resetMockFS();
    const sourcePath = path.join(__dirname, 'fixtures/resources');
    let copyFiles = ['en', 'grc'];
    fs.__loadFilesIntoMockFs(copyFiles, sourcePath, USER_RESOURCES_PATH);
  });
  afterAll(() => {
    // reset mock filesystem data
    fs.__resetMockFS();
  });

  test('Comparing ToolCard Component render for wordAlignment', () => {
    const props = {
      loggedInUser: true,
      currentProjectToolsProgress: {
        wordAlignment: 0.5
      },
      currentProjectToolsSelectedGL: {
        testTool: 'en'
      },
      manifest: {
        project: {
          id: 'tit'
        }
      },
      metadata: {
        name: 'wordAlignment'
      },
      invalidatedReducer: {},
      translate: key => key,
      actions: {
        getProjectProgressForTools: () => jest.fn(),
        setProjectToolGL: () => jest.fn(),
        launchTool: () => jest.fn()
      },
      developerMode: false
    };
    const renderedValue = renderer.create(
      <MuiThemeProvider>
        <ToolCard {...props} />
      </MuiThemeProvider>
    ).toJSON();
    expect(renderedValue).toMatchSnapshot();
  });

  test('Comparing ToolCard Component render for translationWords', () => {
    const props = {
      loggedInUser: true,
      currentProjectToolsProgress: {
        translationWords: 0.5
      },
      currentProjectToolsSelectedGL: {
        testTool: 'en'
      },
      manifest: {
        project: {
          id: 'tit'
        }
      },
      metadata: {
        name: 'translationWords'
      },
      invalidatedReducer: {},
      translate: key => key,
      actions: {
        getProjectProgressForTools: () => jest.fn(),
        setProjectToolGL: () => jest.fn(),
        launchTool: () => jest.fn()
      },
      developerMode: false,
      selectedCategories: [],
      availableCategories: ['kt']
    };
    const renderedValue = renderer.create(
      <MuiThemeProvider>
        <ToolCard {...props} />
      </MuiThemeProvider>
    ).toJSON();
    expect(renderedValue).toMatchSnapshot();
  });

  test('Test GL Selection Change', () => {
    const props = {
      loggedInUser: true,
      currentProjectToolsProgress: {
        testTool: 0.5
      },
      currentProjectToolsSelectedGL: {
        testTool: 'en'
      },
      manifest: {
        project: {
          id: 'tit'
        }
      },
      metadata: {
        name: 'testTool'
      },
      invalidatedReducer: {},
      translate: key => key,
      actions: {
        getProjectProgressForTools: () => jest.fn(),
        setProjectToolGL: () => jest.fn(),
        launchTool: () => jest.fn()
      },
      developerMode: false
    };
    const wrapper = shallow(<ToolCard {...props} />);
    const toolCard = wrapper.instance();
    expect(toolCard.state.selectedGL).toEqual(props.currentProjectToolsSelectedGL[props.metadata.name]);
    const newLanguageId = 'hi';
    toolCard.selectionChange(newLanguageId);
    expect(toolCard.state.selectedGL).toEqual(newLanguageId);
  });

  test('Test if no GL in props the default gateway language should be set', () => {
    const props = {
      loggedInUser: true,
      currentProjectToolsProgress: {
        testTool: 0.5
      },
      currentProjectToolsSelectedGL: {},
      manifest: {
        project: {
          id: 'tit'
        }
      },
      metadata: {
        name: 'testTool'
      },
      invalidatedReducer: {},
      translate: key => key,
      actions: {
        getProjectProgressForTools: () => jest.fn(),
        setProjectToolGL: () => jest.fn(),
        launchTool: () => jest.fn()
      },
      developerMode: false
    };
    const wrapper = shallow(<ToolCard {...props} />);
    const toolCard = wrapper.instance();
    expect(toolCard.state.selectedGL).toEqual(DEFAULT_GATEWAY_LANGUAGE);
  });
});
