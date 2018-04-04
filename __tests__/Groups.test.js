/* eslint-disable no-console */
/* eslint-env jest */
import React from 'react';
import Group from '../src/js/components/groupMenu/Group';
import Groups from '../src/js/components/groupMenu/Groups';
import {shallow} from 'enzyme';
import toJson from 'enzyme-to-json';

describe('Tests for Groups', () => {
  test('Test Groups', () => {
    const props = {
      groups: [<Group key='group1'/>, <Group key='group2'/>]
    };

    // when
    const wrapper = shallow(
      <Groups {...props} />
    );

    // then
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
