/* eslint-disable no-console */
/* eslint-env jest */
import React from 'react';
import GroupItem from '../src/js/components/groupMenu/GroupItem';
import {shallow} from 'enzyme';
import toJson from 'enzyme-to-json';
// helpers
import * as statusBadgeHelpers from '../src/js/helpers/statusBadgeHelpers';

describe('Tests for GroupItem', () => {
  test('Test GroupItem', () => {
    const props = {
      bookName: 'Titus',
      selectionText: 'Paul',
      contextId: {
        reference: {
          chapterVerseMenu: true,
          text: 'Tit 1:1',
          verse: 'Paul'
        }
      },
      actions: {
          changeCurrentContextId: jest.fn()
      },
      statusBadge: statusBadgeHelpers.getStatusBadge(['ok', 'comment']),
      scrollIntoView: jest.fn(),
      inView: jest.fn(),
      active: true,
    };

    // when
    const wrapper = shallow(
      <GroupItem {...props} />
    );

    // then
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
