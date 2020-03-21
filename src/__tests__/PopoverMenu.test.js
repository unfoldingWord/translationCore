/* eslint-env jest */
import React from 'react';
import PropTypes from 'prop-types';
import renderer from 'react-test-renderer';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import SettingsIcon from 'material-ui/svg-icons/action/settings';
import {
  shallow, mount, configure,
} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import PopoverMenu from '../js/components/PopoverMenu';

const mountOptions = {
  context: { muiTheme: getMuiTheme() },
  childContextTypes: { muiTheme: PropTypes.object },
};

beforeAll(() => {
  configure({ adapter: new Adapter() });
});

describe('snapshots', () => {
  test('default', () => {
    const wrapper = renderer.create(
      <MuiThemeProvider>
        <PopoverMenu label="menu"/>
      </MuiThemeProvider>,
    );
    expect(wrapper).toMatchSnapshot();
  });


  test('with icon', () => {
    const wrapper = renderer.create(
      <MuiThemeProvider>
        <PopoverMenu label="menu" icon={<SettingsIcon/>}/>
      </MuiThemeProvider>,
    );
    expect(wrapper).toMatchSnapshot();
  });

  test('dark variant', () => {
    const wrapper = renderer.create(
      <MuiThemeProvider>
        <PopoverMenu label="menu" icon={<SettingsIcon/>} variant="dark"/>
      </MuiThemeProvider>,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
describe('events', () => {
  test('default props', () => {
    const wrapper = shallow(
      <MuiThemeProvider>
        <PopoverMenu label="menu"/>
      </MuiThemeProvider>,
    );
    expect(wrapper.prop('label')).toEqual('menu');
    expect(wrapper.prop('variant')).toEqual('secondary');
  });

  test('default state', () => {
    const wrapper = mount(
      <PopoverMenu label="menu"/>
      , mountOptions);
    expect(wrapper.state('open')).toEqual(false);
    expect(wrapper.state('hover')).toEqual(false);
  });

  test('hover', () => {
    const wrapper = mount(
      <PopoverMenu label="menu"/>
      , mountOptions);
    expect(wrapper.state('hover')).toEqual(false);
    wrapper.simulate('mouseOver');
    expect(wrapper.state('hover')).toEqual(true);
    wrapper.simulate('mouseOut');
    expect(wrapper.state('hover')).toEqual(false);
  });

  test('button click', () => {
    const wrapper = mount(
      <PopoverMenu label="menu"/>
      , mountOptions);
    expect(wrapper.state('open')).toEqual(false);
    wrapper.simulate('click');
    expect(wrapper.state('open')).toEqual(true);
  });
});
