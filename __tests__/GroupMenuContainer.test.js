/* eslint-disable no-console */
/* eslint-env jest */
jest.unmock('fs-extra');
import React from 'react';
import path from 'path-extra';
import fs from 'fs-extra';
import {shallow, configure, mount} from 'enzyme';
import toJson from 'enzyme-to-json';
import Adapter from 'enzyme-adapter-react-16';
import { Grid } from 'react-bootstrap';
// components & containers
import { GroupMenuContainer } from '../src/js/containers/GroupMenuContainer';
import Groups from '../src/js/components/groupMenu/Groups';
import Group from '../src/js/components/groupMenu/Group';
import GroupItem from '../src/js/components/groupMenu/GroupItem';
// helpers
import * as ResourcesHelpers from "../src/js/helpers/ResourcesHelpers";

beforeAll(() => {
  configure({adapter: new Adapter()});
});

describe('GroupMenuContainer tests for translationWords using Titus', () => {
  let contextIdReducer ,wordAlignmentReducer, toolsReducer, groupsDataReducer, projectDetailsReducer,
    groupsIndexReducer, groupMenuReducer;
  const enTwVersionDir = ResourcesHelpers.getLatestVersionInPath(path.join(__dirname, '../tC_resources/resources/en/translationHelps/translationWords'))
  const groupsIndex = require(path.join(enTwVersionDir, 'kt/index.json'));
  let groupsData;

  beforeAll(() => {
    groupsData = {};
    const grcTwVersionPath = ResourcesHelpers.getLatestVersionInPath(path.join(__dirname, '../tC_resources/resources/grc/translationHelps/translationWords'));
    const groupsDataDirectory = path.join(grcTwVersionPath, 'kt/groups/tit');
    let groupDataFolderObjs = fs.readdirSync(groupsDataDirectory);
    for (let groupId in groupDataFolderObjs) {
      if (path.extname(groupDataFolderObjs[groupId]) !== '.json') {
        continue;
      }
      let groupName = groupDataFolderObjs[groupId].split('.')[0];
      const groupPath = path.join(groupsDataDirectory, groupName + '.json');
      let groupData;
      groupData = fs.readJsonSync(groupPath);
      if (groupData) {
        groupsData[groupName] = groupData;
      }
    }
  });

  beforeEach(async () => {
    contextIdReducer = {
      contextId: {
        groupId: "god",
        occurrence: 1,
        quote: "Θεοῦ",
        reference: {
          bookId: "tit",
          chapter: 1,
          verse: 3
        },
        strong: ["G23160"],
        tool: "translationWords"
      }
    };
    wordAlignmentReducer = {
      alignmentData: {}
    };
    toolsReducer = {
      currentToolViews: {},
      currentToolName: 'translationWords',
      currentToolTitle: 'translationWords',
      toolsMetadata:[]
    };
    groupsDataReducer = {
      groupsData: groupsData,
      loadedFromFileSystem: true
    };
    projectDetailsReducer = {
      projectSaveLocation: '',
      manifest: {
        project: {
          id: 'tit',
          name: 'Titus'
        }
      },
      currentProjectToolsProgress: {},
      projectType: null
    };
    groupsIndexReducer = {
      groupsIndex: groupsIndex,
      loadedFromFileSystem: false
    };
    groupMenuReducer = {
      menuVisibility: true,
      isSubMenuExpanded: true,
      filters: {
        invalidated: false,
        reminders: false,
        selections: false,
        noSelections: false,
        verseEdits: false,
        comments: false
      }
    };
  });

  test('GroupMenuContainer renders Titus', () => {
    // given
    const expectedGroups = 57;
    const godIndex = 22;
    const expectedGodGroupItems = 13;

    // when
    const wrapper = shallow(
      <GroupMenuContainer
        groupsDataReducer={groupsDataReducer}
        contextIdReducer={contextIdReducer}
        projectDetailsReducer={projectDetailsReducer}
        groupsIndexReducer={groupsIndexReducer}
        actions={{
          groupMenuExpandSubMenu: jest.fn(),
          changeCurrentContextId: jest.fn()
        }}
        groupMenuReducer={groupMenuReducer}
        toolsReducer={toolsReducer}
        wordAlignmentReducer={wordAlignmentReducer}
        translate={k=>k}
      />
    );
    const groups = wrapper.find(Grid).find(Groups).dive().find(Group);

    // then
    expect(groups.length).toEqual(expectedGroups);
    groups.forEach((group, index)=>{
      let groupItems = group.dive().find(GroupItem);
      if (index === godIndex) {
        expect(groupItems.length).toEqual(expectedGodGroupItems);
      } else {
        expect(groupItems.length).toEqual(0);
      }
    });
  });

  test('GroupMenuContainer renders the status badge for a edited translationWords as "pencil" glyph', () => {
    // given
    const godVerseIndex = 3;
    groupsDataReducer.groupsData.god[godVerseIndex].verseEdits = true;

    // when
    const wrapper = shallow(
      <GroupMenuContainer
        groupsDataReducer={groupsDataReducer}
        contextIdReducer={contextIdReducer}
        projectDetailsReducer={projectDetailsReducer}
        groupsIndexReducer={groupsIndexReducer}
        actions={{
          groupMenuExpandSubMenu: jest.fn(),
          changeCurrentContextId: jest.fn()
        }}
        groupMenuReducer={groupMenuReducer}
        toolsReducer={toolsReducer}
        wordAlignmentReducer={wordAlignmentReducer}
        translate={k=>k}
      />
    );
    const statusBadge = wrapper.instance().getStatusBadge(groupsDataReducer.groupsData.god[godVerseIndex]);
    const statusBadgeWrapper = mount(statusBadge);

    // then
    expect(statusBadgeWrapper.find('.glyphicon-pencil').length).toEqual(1);
    expect(statusBadgeWrapper.find('.glyphicon').length).toEqual(1);
    expect(toJson(statusBadgeWrapper)).toMatchSnapshot();
  });

  test('GroupMenuContainer renders the status badge for a not completed wordAlignment as an empty glyph', () => {
    // given
    const godVerseIndex = 1;

    // when
    const wrapper = shallow(
      <GroupMenuContainer
        groupsDataReducer={groupsDataReducer}
        contextIdReducer={contextIdReducer}
        projectDetailsReducer={projectDetailsReducer}
        groupsIndexReducer={groupsIndexReducer}
        actions={{
          groupMenuExpandSubMenu: jest.fn(),
          changeCurrentContextId: jest.fn()
        }}
        groupMenuReducer={groupMenuReducer}
        toolsReducer={toolsReducer}
        wordAlignmentReducer={wordAlignmentReducer}
        translate={k=>k}
      />
    );
    const statusBadge = wrapper.instance().getStatusBadge(groupsDataReducer.groupsData.god[godVerseIndex]);
    const statusBadgeWrapper = mount(statusBadge);

    // then
    expect(statusBadgeWrapper.find('.glyphicon-blank').length).toEqual(1);
    expect(statusBadgeWrapper.find('.glyphicon').length).toEqual(1);
    expect(toJson(statusBadgeWrapper)).toMatchSnapshot();
  });

  test('GroupMenuContainer renders the status badge for all status booleans', () => {
    // given
    const godVerseIndex = 2;
    groupsDataReducer.groupsData.god[godVerseIndex].invalidated = true;
    groupsDataReducer.groupsData.god[godVerseIndex].reminders = true;
    groupsDataReducer.groupsData.god[godVerseIndex].selections = true;
    groupsDataReducer.groupsData.god[godVerseIndex].verseEdits = true;
    groupsDataReducer.groupsData.god[godVerseIndex].comments = true;

    // when
    const wrapper = shallow(
      <GroupMenuContainer
        groupsDataReducer={groupsDataReducer}
        contextIdReducer={contextIdReducer}
        projectDetailsReducer={projectDetailsReducer}
        groupsIndexReducer={groupsIndexReducer}
        actions={{
          groupMenuExpandSubMenu: jest.fn(),
          changeCurrentContextId: jest.fn()
        }}
        groupMenuReducer={groupMenuReducer}
        toolsReducer={toolsReducer}
        wordAlignmentReducer={wordAlignmentReducer}
        translate={k=>k}
      />
    );
    const statusBadge = wrapper.instance().getStatusBadge(groupsDataReducer.groupsData.god[godVerseIndex]);
    const statusBadgeWrapper = mount(statusBadge);

    // then
    expect(statusBadgeWrapper.find('.glyphicon-invalidated').length).toEqual(1);
    expect(statusBadgeWrapper.find('.status-badge').prop('data-tip')).toMatchSnapshot();
    expect(statusBadgeWrapper.find('.badge').text()).toEqual("5");
    expect(toJson(statusBadgeWrapper)).toMatchSnapshot();
  });

  test('Tests the handleFilterShowHideToggle in GroupMenuContainer', () => {
    // when
    const wrapper = shallow(
      <GroupMenuContainer
        groupsDataReducer={groupsDataReducer}
        contextIdReducer={contextIdReducer}
        projectDetailsReducer={projectDetailsReducer}
        groupsIndexReducer={groupsIndexReducer}
        actions={{
          groupMenuExpandSubMenu: jest.fn(),
          changeCurrentContextId: jest.fn()
        }}
        groupMenuReducer={groupMenuReducer}
        toolsReducer={toolsReducer}
        wordAlignmentReducer={wordAlignmentReducer}
        translate={k=>k}
      />
    );
    const component = wrapper.instance();

    // then
    expect(component.state.expandFilter).not.toBeTruthy();
    component.handleFilterShowHideToggle();
    expect(component.state.expandFilter).toBeTruthy();
    component.handleFilterShowHideToggle();
    expect(component.state.expandFilter).not.toBeTruthy();
  });

  test('Tests the getItemGroupData in GroupMenuContainer', () => {
    // when
    const wrapper = shallow(
      <GroupMenuContainer
        groupsDataReducer={groupsDataReducer}
        contextIdReducer={contextIdReducer}
        projectDetailsReducer={projectDetailsReducer}
        groupsIndexReducer={groupsIndexReducer}
        actions={{
          groupMenuExpandSubMenu: jest.fn(),
          changeCurrentContextId: jest.fn()
        }}
        groupMenuReducer={groupMenuReducer}
        toolsReducer={toolsReducer}
        wordAlignmentReducer={wordAlignmentReducer}
        translate={k=>k}
      />
    );
    const component = wrapper.instance();
    const groupData = component.getItemGroupData(contextIdReducer.contextId, {id:'god'});

    // then
    expect(groupData.contextId).toEqual(contextIdReducer.contextId);
  });
});
