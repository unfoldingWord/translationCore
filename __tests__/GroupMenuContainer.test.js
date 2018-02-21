/* eslint-disable no-console */
/* eslint-env jest */
jest.unmock('fs-extra');
import React from 'react';
import { GroupMenuContainer } from '../src/js/containers/GroupMenuContainer';
import Groups from '../src/js/components/groupMenu/Groups';
import Group from '../src/js/components/groupMenu/Group';
import {shallow, configure} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { Grid } from 'react-bootstrap';

beforeAll(() => {
  configure({adapter: new Adapter()});
});

describe('GroupMenuContainer', () => {
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
      currentToolName: 'cheese',
      currentToolTitle: null,
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
    const chapter = "1";
    const verse = "1";
    contextIdReducer.contextId.reference.chapter = chapter;
    contextIdReducer.contextId.reference.verse = verse;
    const expectedVerses = 82;
    const enzymeWrapper = shallow(
      <GroupMenuContainer
        groupsDataReducer={groupsDataReducer}
        contextIdReducer={contextIdReducer}
        projectDetailsReducer={projectDetailsReducer}
        groupsIndexReducer={groupsIndexReducer}
        actions={{}}
        groupMenuReducer={groupMenuReducer}
        toolsReducer={toolsReducer}
        wordAlignmentReducer={wordAlignmentReducer}
      />
    );
    const group = enzymeWrapper.find(Grid).find(Groups).dive().find(Group);
    expect(group.length).toEqual(1);

    // when
    const getGroupItems = group.getElement().props.getGroupItems(); // make sure it doesn't crash on verses without alignment data

    // then
    expect(getGroupItems.length).toEqual(expectedVerses);
  });
});
