/* eslint-disable no-console */
/* eslint-env jest */
import React from 'react';
import GroupsMenuFilterBubble from '../src/js/components/groupMenu/GroupsMenuFilterBubble';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

describe('Tests for GroupsMenuFilterBubble', () => {
  test('Test GroupsMenuFilterBubble', () => {
    const props = {
      name: 'showMe',
      text: 'My filter',
      setFilter: jest.fn()
    };

    // when
    const wrapper = shallow(
      <GroupsMenuFilterBubble {...props} />
    );

    // then
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('Test GroupsMenuFilterBubble handleFilterRemove()', () => {
    const setFilter = jest.fn();
    const props = {
      name: 'showMe',
      text: 'My filter',
      setFilter: setFilter
    };

    // when
    const wrapper = shallow(
      <GroupsMenuFilterBubble {...props} />
    );
    wrapper.find('.filter-remove').simulate('click');

    // then
    expect(setFilter).toHaveBeenCalledWith(props.name, false);
  });
});
