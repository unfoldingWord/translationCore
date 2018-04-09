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

  test('Test GroupsMenuFilterOption handleCheckboxChange()', () => {
    const setFilter = jest.fn();
    const props = {
      name: 'showMe',
      icon: <Glyphicon glyph='pencil'/>,
      text: 'option text',
      setFilter: setFilter,
      checked: false,
      disabled: false
    };

    // when
    const wrapper = shallow(
      <GroupsMenuFilterOption {...props} />
    );
    wrapper.find('input').simulate('change', {target: {checked: !props.checked}});

    // then
    expect(setFilter).toHaveBeenCalledWith(props.name, true);
  });

});
