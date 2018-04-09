/* eslint-disable no-console */
/* eslint-env jest */
import React from 'react';
import GroupsMenuFilter from '../src/js/components/groupMenu/GroupsMenuFilter';
import {shallow} from 'enzyme';
import toJson from 'enzyme-to-json';

describe('Tests for GroupsMenuFilter', () => {
  test('Test GroupsMenuFilter for translationWords expanded', () => {
    const props = {
      currentToolName: 'translationWords',
      translate: k=>k,
      setFilter: jest.fn(),
      showInvalidated: true,
      showBookmarks: true,
      showSelections: true,
      showNoSelections: true,
      showVerseEdits: true,
      showComments: true,
      expandFilter: true
    };

    // when
    const wrapper = shallow(
      <GroupsMenuFilter {...props} />
    );

    // then
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('Test GroupsMenuFilter for translationWords collapsed', () => {
    const props = {
      currentToolName: 'translationWords',
      translate: k=>k,
      setFilter: jest.fn(),
      showInvalidated: true,
      showBookmarks: true,
      showSelections: true,
      showNoSelections: true,
      showVerseEdits: true,
      showComments: true,
      expandFilter: false
    };

    // when
    const wrapper = shallow(
      <GroupsMenuFilter {...props} />
    );

    // then
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
