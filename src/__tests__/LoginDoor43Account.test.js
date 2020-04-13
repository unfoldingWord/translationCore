/* eslint-env jest */
import React from 'react';
import renderer from 'react-test-renderer';
import { mount, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import PropTypes from 'prop-types';
import LoginDoor43Account from '../js/components/home/usersManagement/LoginDoor43Account';

const wrapperOptions = {
  context: { muiTheme: getMuiTheme() },
  childContextTypes: { muiTheme: PropTypes.object },
};

beforeAll(() => {
  configure({ adapter: new Adapter() });
});

test('snapshot', () => {
  const wrapper = renderer.create(
    <MuiThemeProvider>
      <LoginDoor43Account translate={key => key}
        showPopover={jest.fn()}
        loginUser={jest.fn()}
        setView={jest.fn()}/>
    </MuiThemeProvider>,
  );
  expect(wrapper).toMatchSnapshot();
});
//
describe('callbacks', () => {
  let popoverCallback;
  let loginCallback;
  let setViewCallback;
  let wrapper;

  beforeEach(() => {
    configure({ adapter: new Adapter() });
    popoverCallback = jest.fn();
    loginCallback = jest.fn();
    setViewCallback = jest.fn();
    wrapper = mount(
      <LoginDoor43Account translate={key => key}
        showPopover={popoverCallback}
        loginUser={loginCallback}
        setView={setViewCallback}/>
      , wrapperOptions);
  });

  test('info', () => {
    wrapper.find('span#info-btn').simulate('click');
    expect(popoverCallback).toBeCalled();
  });

  test('login with input', () => {
    const instance = wrapper.instance();
    const state = {
      username: 'user',
      password: 'password',
    };
    instance.setState(state);
    wrapper.find('button#login-btn').simulate('click');
    expect(loginCallback).toBeCalledWith(state);
  });

  test('login without input', () => {
    wrapper.find('button#login-btn').simulate('click');
    expect(loginCallback).not.toBeCalled();
  });

  test('setView', () => {
    wrapper.find('button#setview-btn').simulate('click');
    expect(setViewCallback).toBeCalled();
  });
});
