/* eslint-disable no-console */
/* eslint-env jest */
import React from 'react';
import GroupsMenuFilter from '../src/js/components/groupMenu/GroupsMenuFilter';
import {shallow} from 'enzyme';
import toJson from 'enzyme-to-json';
import GroupsMenuFilterBubble from '../src/js/components/groupMenu/GroupsMenuFilterBubble';
import GroupsMenuFilterOption from '../src/js/components/groupMenu/GroupsMenuFilterOption';

describe('Tests for GroupsMenuFilter', () => {
  test('Test GroupsMenuFilter for translationWords expanded', () => {
    // given
    const numOptions = 6;
    const numBubbles = 0;
    const numCheckedOptions = 6;

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
    const filterOptions = wrapper.find(GroupsMenuFilterOption);
    const checkedOptions = wrapper.find({ checked: true })
    const filterBubbles = wrapper.find(GroupsMenuFilterBubble);

    // then
    expect(filterOptions.length).toEqual(numOptions);
    expect(filterBubbles.length).toEqual(numBubbles);
    expect(checkedOptions.length).toEqual(numCheckedOptions);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('Test GroupsMenuFilter for translationWords expanded with 3 options checked', () => {
    // given
    const numOptions = 6;
    const numBubbles = 0;
    const numCheckedOptions = 3;

    const props = {
      currentToolName: 'translationWords',
      translate: k=>k,
      setFilter: jest.fn(),
      showInvalidated: false,
      showBookmarks: true,
      showSelections: false,
      showNoSelections: true,
      showVerseEdits: false,
      showComments: true,
      expandFilter: true
    };

    // when
    const wrapper = shallow(
      <GroupsMenuFilter {...props} />
    );
    const filterOptions = wrapper.find(GroupsMenuFilterOption);
    const checkedOptions = wrapper.find({ checked: true })
    const filterBubbles = wrapper.find(GroupsMenuFilterBubble);

    // then
    expect(filterOptions.length).toEqual(numOptions);
    expect(filterBubbles.length).toEqual(numBubbles);
    expect(checkedOptions.length).toEqual(numCheckedOptions);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('Test GroupsMenuFilter for translationWords collapsed with all options', () => {
    // given
    const numOptions = 0;
    const numBubbles = 6;

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
    const filterOptions = wrapper.find(GroupsMenuFilterOption);
    const filterBubbles = wrapper.find(GroupsMenuFilterBubble);

    // then
    expect(filterOptions.length).toEqual(numOptions);
    expect(filterBubbles.length).toEqual(numBubbles);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('Test GroupsMenuFilter for translationWords collapsed with no options', () => {
    // given
    const numOptions = 0;
    const numBubbles = 0;

    const props = {
      currentToolName: 'translationWords',
      translate: k=>k,
      setFilter: jest.fn(),
      showInvalidated: false,
      showBookmarks: false,
      showSelections: false,
      showNoSelections: false,
      showVerseEdits: false,
      showComments: false,
      expandFilter: false
    };

    // when
    const wrapper = shallow(
      <GroupsMenuFilter {...props} />
    );
    const filterOptions = wrapper.find(GroupsMenuFilterOption);
    const filterBubbles = wrapper.find(GroupsMenuFilterBubble);

    // then
    expect(filterOptions.length).toEqual(numOptions);
    expect(filterBubbles.length).toEqual(numBubbles);
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
