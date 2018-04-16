import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import path from 'path-extra';
import fs from "fs-extra";
// actions
import * as SelectionsActions from '../src/js/actions/SelectionsActions';
import * as GroupsDataActions from "../src/js/actions/GroupsDataActions";
import {validateAllSelectionsForVerse} from "../src/js/actions/SelectionsActions";
import groupsDataReducer from "../src/js/reducers/groupsDataReducer";
// constants
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
const PROJECTS_PATH = path.join(__dirname, 'fixtures', 'checkData');
const CHECKDATA_DIRECTORY = path.join(PROJECTS_PATH, '.apps', 'translationCore', 'checkData');

jest.unmock('fs-extra');

describe('SelectionsActions', () => {

  it('loadBiblesChapter() gal', () => {
    // given
    const bookId = 'tit';
    const targetVerse =  "Paul, a servant of God and an apostle of Jesus Christ, for the faith of God's chosen people and the knowledge of the truth that agrees with godliness, ";
    const projectPath = path.join(PROJECTS_PATH, 'en_tit');
    const groupsDataReducer = fs.readJSONSync(path.join(projectPath, 'groupsDataReducer.json'));
    const contextId = {
      reference: {
        bookId: bookId,
        chapter:1,
        verse: 1
      }
    };

    const store = mockStore({
      actions: {},
      groupsDataReducer,
      toolsReducer: {
        currentToolName: 'translationWords'
      },
      loginReducer : {
        loggedInUser: false,
        userdata: {
          username: 'dummy-test'
        },
        feedback: '',
        subject: 'Bug Report',
        placeholder: 'Leave us your feedback!'
      },
        projectDetailsReducer: {
          manifest: {
            project: {
              id: bookId
            }
          },
          projectSaveLocation: path.resolve(projectPath)
        },
      contextIdReducer: {
        contextId
      }
    });
    const results = {
      selectionsChanged: false
    };

    // when
    store.dispatch(validateAllSelectionsForVerse(targetVerse, results));

    // then
    const state = store.getState();
    expect(state).toEqual(true);
  });

});

//
// helpers
//

