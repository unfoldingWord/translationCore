/* eslint-disable no-console */
/* eslint-env jest */
import * as ResourcesHelpers from "../src/js/helpers/ResourcesHelpers";

jest.unmock('fs-extra');
import React from 'react';
import { GroupMenuContainer } from '../src/js/containers/GroupMenuContainer';
import {shallow} from 'enzyme';
import { Grid, Col, Glyphicon } from 'react-bootstrap';

describe('GroupMenuContainer', () => {
  let contextIdReducer ,wordAlignmentReducer, resourcesReducer, toolsReducer, groupsDataReducer, projectDetailsReducer,
    groupsIndexReducer, groupMenuReducer;
  const luke1 = require('./fixtures/project/wordAlignmentData/luke/luk/1.json');
  const lukeIndex = require('./fixtures/project/wordAlignmentData/luke/index.json');

  beforeEach(() => {
    contextIdReducer = {
      "contextId": {
        "groupId": "figs_metaphor",
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
      groupsData: {},
      loadedFromFileSystem: false
    };
    projectDetailsReducer = {
      projectSaveLocation: '',
      manifest: {},
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

  test('GroupMenuContainer renders Luke 1:1', () => {
    // given
    const chapter = "1";
    const verse = "1";
    contextIdReducer.contextId.reference.chapter = chapter;
    contextIdReducer.contextId.reference.verse = verse;

    // when
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

    // then
    const div = enzymeWrapper.find('div');
    const grid = div.find(Grid);
    expect(grid.length).toEqual(1);
  });
});
