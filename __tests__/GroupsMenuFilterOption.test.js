/* eslint-disable no-console */
/* eslint-env jest */
import React from 'react';
import GroupsMenuFilterOption from '../src/js/components/groupMenu/GroupsMenuFilterOption';
import { Glyphicon } from 'react-bootstrap';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

describe('Tests for GroupsMenuFilterOption', () => {
  test('Test GroupsMenuFilterOption', () => {
    const props = {
      name: 'showMe',
      text: 'My filter option',
      icon: <Glyphicon glyph='pencil'/>,
      setFilter: jest.fn(),
      checked: true,
      disabled: false
    };

    // when
    const wrapper = shallow(
      <GroupsMenuFilterOption {...props} />
    );

    // then
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
