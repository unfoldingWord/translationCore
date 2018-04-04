/* eslint-disable no-console */
/* eslint-env jest */
import React from 'react';
import GroupItem from '../src/js/components/groupMenu/GroupItem';
import {shallow} from 'enzyme';
import toJson from 'enzyme-to-json';
import { Glyphicon } from 'react-bootstrap';

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
      statusBadge: <Glyphicon glyph="ok"/>,
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
