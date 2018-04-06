/* eslint-disable no-console */
/* eslint-env jest */
import React from 'react';
import GroupsMenuFilter from '../src/js/components/groupMenu/GroupsMenuFilter';
import {shallow} from 'enzyme';
import toJson from 'enzyme-to-json';

describe('Tests for GroupsMenuFilter', () => {
  test('Test GroupsMenuFilter for wordAlignment', () => {
    const props = {
      currentToolName: 'wordAlignment',
      translate: k=>k,
      menuFilterWidth: 238
    };

    // when
    const wrapper = shallow(
      <GroupsMenuFilter {...props} />
    );

    // then
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('Test GroupsMenuFilter for translationWords', () => {
    const props = {
      currentToolName: 'translationWords',
      translate: k=>k,
      menuFilterWidth: '100%'
    };

    // when
    const wrapper = shallow(
      <GroupsMenuFilter {...props} />
    );

    // then
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
