/* eslint-env jest */
import React from 'react';
import renderer from 'react-test-renderer';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import ToolsManagementContainer from '../src/js/containers/home/ToolsManagementContainer';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

jest.mock('../src/js/components/home/toolsManagement/ToolsCards', () => 'ToolsCards');

describe('ToolsManagementCotnainer container tests', () => {

  test('Check ToolsManagementContainer container', () => {
    const props = {
      reducers: {
        toolsReducer: {
          toolsMetadata: {}
        },
        loginReducer: {
          loggedInUser: {}
        },
        settingsReducer: {
          currentSettings: {
            developerMode: false
          }
        },
        projectDetailsReducer: {
          manifest: {},
          projectSaveLocation: 'save/location',
          currentProjectToolsProgress: {},
          currentProjectToolsSelectedGL: {}
        }
      },
      translate: k=>k
    };
    const wrapper = shallow(<ToolsManagementContainer {...props} />);
    expect(toJson(wrapper)).toMatchSnapshot();
    
    expect(renderedValue).toMatchSnapshot();
  });
});
