/* eslint-env jest */
import React from 'react';
import ToolCard from '../src/js/components/home/toolsManagement/ToolCard';
import { DEFAULT_GATEWAY_LANGUAGE } from '../src/js/helpers/LanguageHelpers';
import renderer from 'react-test-renderer';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { shallow } from 'enzyme';

jest.mock('../src/js/components/home/toolsManagement/ToolCardProgress', () => 'ToolCardProgress');
jest.mock('../src/js/components/home/toolsManagement/GlDropDownList', () => 'GlDropDownList');

// Tests for ToolCard React Component
describe('Test ToolCard component',()=>{
  test('Comparing ToolCard Component render with snapshot taken 11/07/2017 in __snapshots__ should match', () => {
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
      translate: key => key,
      actions: {
        getProjectProgressForTools: () => jest.fn(),
        setProjectToolGL: () => jest.fn(),
        launchTool: () => jest.fn()
      }
    };
    const renderedValue =  renderer.create(
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
      translate: key => key,
      actions: {
        getProjectProgressForTools: () => jest.fn(),
        setProjectToolGL: () => jest.fn(),
        launchTool: () => jest.fn()
      }
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
      translate: key => key,
      actions: {
        getProjectProgressForTools: () => jest.fn(),
        setProjectToolGL: () => jest.fn(),
        launchTool: () => jest.fn()
      }
    };
    const wrapper = shallow(<ToolCard {...props} />);
    const toolCard = wrapper.instance();
    expect(toolCard.state.selectedGL).toEqual(DEFAULT_GATEWAY_LANGUAGE);
  });
});
