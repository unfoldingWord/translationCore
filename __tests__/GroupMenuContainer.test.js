/* eslint-disable no-console */
/* eslint-env jest */
jest.unmock('fs-extra');
import React from 'react';
import path from 'path-extra';
import fs from 'fs-extra';
import { GroupMenuContainer } from '../src/js/containers/GroupMenuContainer';
import Groups from '../src/js/components/groupMenu/Groups';
import Group from '../src/js/components/groupMenu/Group';
import GroupItem from '../src/js/components/groupMenu/GroupItem';
import {shallow, configure, mount} from 'enzyme';
import toJson from 'enzyme-to-json';
import Adapter from 'enzyme-adapter-react-16';
import { Grid } from 'react-bootstrap';

beforeAll(() => {
  configure({adapter: new Adapter()});
});

describe('GroupMenuContainer tests for wordAlignment using Luke', () => {
  let contextIdReducer ,wordAlignmentReducer, toolsReducer, groupsDataReducer, projectDetailsReducer,
    groupsIndexReducer, groupMenuReducer;
  const luke1 = require('./fixtures/project/wordAlignmentData/luke/luk/1.json');
  const lukeIndex = require('./fixtures/project/wordAlignmentData/luke/index.json');
  const chapter_1 = [];
  const chapter1GroupsData = {
    chapter_1: chapter_1
  };
  for (let v = 1; v <= 82; v++) {
    chapter_1.push({
      contextId: {
        groupId: "chapter_" + v,
        reference: {
          bookId: "luk",
          chapter: 1,
          verse: v
        },
        tool: "wordAlignment"
      }
    });
  }

  beforeEach(() => {
    contextIdReducer = {
      "contextId": {
        "groupId": "chapter_1",
        "occurrence": 1,
        "quote": "that he put before them",
        "information": "Paul speaks about good deeds as if they were objects that God could place in front of people. AT: \"that God prepared for them to do\" (See: [[:en:ta:vol1:translate:figs_metaphor]]) \n",
        "reference": {
          "bookId": "luk",
          "chapter": 1,
          "verse": 1
        },
        "tool": "TranslationNotesChecker"
      }
    };
    wordAlignmentReducer = {
      alignmentData: {
        "1": luke1
      }
    };
    toolsReducer = {
      currentToolViews: {},
      currentToolName: 'wordAlignment',
      currentToolTitle: 'wordAlignment',
      toolsMetadata:[]
    };
    groupsDataReducer = {
      groupsData: chapter1GroupsData,
      loadedFromFileSystem: false
    };
    projectDetailsReducer = {
      projectSaveLocation: '',
      manifest: {
        project: {
          id: 'luk',
          name: 'Luke'
        }
      },
      currentProjectToolsProgress: {},
      projectType: null
    };
    groupsIndexReducer = {
      groupsIndex: lukeIndex,
      loadedFromFileSystem: false
    };
    groupMenuReducer = {
      menuVisibility: true,
      isSubMenuExpanded: true
    };
  });

  // verses 81 and 82 are not defined, so we should fail safe
  test('GroupMenuContainer renders Luke 1, verses 1 to 82 without crashing', () => {
    // given
    const expectedGroups = 1;
    const expectedVerses = 82;

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
    const group = wrapper.find(Grid).find(Groups).dive().find(Group);
    const getGroupItems = group.getElement().props.getGroupItems(); // make sure it doesn't crash on verses without alignment data

    // then
    expect(group.length).toEqual(expectedGroups);
    expect(getGroupItems.length).toEqual(expectedVerses);
  });

  test('GroupMenuContainer renders the status badge for a completed wordAlignment as "ok" glyph', () => {
    // given
    wordAlignmentReducer.alignmentData["1"]["1"].wordBank = []; // Makes this alignment completed

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
    const statusBadge = wrapper.instance().getStatusBadge(groupsDataReducer.groupsData.chapter_1[0]);
    const statusBadgeWrapper = mount(statusBadge);

    // then
    expect(statusBadgeWrapper.find('.glyphicon-ok').length).toEqual(1);
    expect(statusBadgeWrapper.find('.glyphicon').length).toEqual(1);
    expect(statusBadge).toMatchSnapshot();
  });

  test('GroupMenuContainer renders the status badge for a not completed wordAlignment as an empty glyph', () => {
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
    const statusBadge = wrapper.instance().getStatusBadge(groupsDataReducer.groupsData.chapter_1[1]);
    const statusBadgeWrapper = mount(statusBadge);

    // then
    expect(statusBadgeWrapper.find('.glyphicon-blank').length).toEqual(1);
    expect(statusBadgeWrapper.find('.glyphicon').length).toEqual(1);
    expect(statusBadge).toMatchSnapshot();
  });
});

describe('GroupMenuContainer tests for translationWords using Titus', () => {
  let contextIdReducer ,wordAlignmentReducer, toolsReducer, groupsDataReducer, projectDetailsReducer,
    groupsIndexReducer, groupMenuReducer;
  const groupsIndex = require('../tC_resources/resources/en/translationHelps/translationWords/v8/kt/index.json');
  let groupsData;

  beforeAll(() => {
    groupsData = {};
    const groupsDataDirectory = path.join(__dirname, '../tC_resources/resources/grc/translationHelps/translationWords/v0/kt/groups/tit');
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
      "contextId": {
        "groupId": "god",
        "occurrence": 1,
        "quote": "Θεοῦ",
        "reference": {
          "bookId": "tit",
          "chapter": 1,
          "verse": 3
        },
        "strong": ["G23160"],
        "tool": "translationWords"
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
      isSubMenuExpanded: true
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
      if (index == godIndex) {
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
});
