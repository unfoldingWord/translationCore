/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import ToolsManagementContainer from '../src/js/containers/home/ToolsManagementContainer';
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);


describe('ToolsManagementCotnainer container tests', () => {

  test('Check ToolsManagementContainer container instructions', () => {
    const props = {
      store: mockStore({
        toolsReducer: {
          toolsMetadata: []
        },
        loginReducer: {
          loggedInUser: true
        },
        settingsReducer: {
          currentSettings: {
            developerMode: false
          }
        },
        projectDetailsReducer: {
          manifest: {
            project: {
              id: ''
            }
          },
          projectSaveLocation: 'save/location',
          currentProjectToolsProgress: {},
          currentProjectToolsSelectedGL: {}
        }
      }),
      translate: k=>k
    };
    const wrapper = shallow(<ToolsManagementContainer {...props} />);
    expect(toJson(wrapper.dive())).toMatchSnapshot();
  });

});
