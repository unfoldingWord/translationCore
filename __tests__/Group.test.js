/* eslint-disable no-console */
/* eslint-env jest */
import React from 'react';
import Group from '../src/js/components/groupMenu/Group';
import {shallow} from 'enzyme';
import toJson from 'enzyme-to-json';

describe('Tests for Group', () => {
  test('Test Group', () => {
    const props = {
      groupMenuReducer: {
        isSubMenuExpanded: true
      },
      actions: {
        groupMenuExpandSubMenu: jest.fn()
      },
      openGroup: jest.fn(),
      progress: .5,
      groupIndex: {
        name: 'God'
      },
      getGroupItems: jest.fn(),
      active: true
    };

    // when
    const wrapper = shallow(
      <Group {...props} />
    );

    // then
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
