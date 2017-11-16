/* eslint-env jest */

import React from 'react';
import LoginDoor43Account from '../src/js/components/home/usersManagement/LoginDoor43Account';
import {shallow} from 'enzyme';

// Tests for LoginDoor43Account React Component
describe('Test LoginDoor43Account component',()=>{
  test('Test username field of LoginDoor43Account has the focus function', () => {
    const props = {
      actions: {
        showPopover: jest.fn()
      },
      setView: jest.fn(),
      loginUser: jest.fn()
    };
    const enzymeWrapper = shallow(<LoginDoor43Account {...props} />);
    const usernameField = enzymeWrapper.find('TextField.Username');
    expect(usernameField.node.ref.name).toEqual('focusUsernameInputField');
  });
});
