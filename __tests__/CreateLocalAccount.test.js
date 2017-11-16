/* eslint-env jest */

import React from 'react';
import CreateLocalAccount from '../src/js/components/home/usersManagement/CreateLocalAccount';
import {shallow} from 'enzyme';

// Tests for CreateLocalAccount React Component
describe('Test CreateLocalAccount component',()=>{
  test('Test username field of CreateLocalAccount has the focus function', () => {
    const props = {
      actions: {
        showPopover: jest.fn()
      },
      setView: jest.fn(),
      loginUser: jest.fn()
    };
    const enzymeWrapper = shallow(<CreateLocalAccount {...props} />);
    const usernameField = enzymeWrapper.find('TextField.Username');
    expect(usernameField.node.ref.name).toEqual('focusUsernameInputField');
  });
});
