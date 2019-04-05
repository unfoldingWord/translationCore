import path from "path-extra";
import fs from "fs-extra";
import types from './ActionTypes';
// actions
import {getGroupDataForVerse, showSelectionsInvalidatedWarning, validateSelections} from "./SelectionsActions";
import * as AlertModalActions from "./AlertModalActions";
// helpers
import {generateTimestamp} from '../helpers/index';
import * as gatewayLanguageHelpers from '../helpers/gatewayLanguageHelpers';
import {delay} from "../helpers/bodyUIHelpers";
import {
  getSelectedToolApi,
  getSelectedToolName,
  getSupportingToolApis,
  getTranslate,
  getUsername
} from '../selectors';
import {batchActions} from "redux-batched-actions";
import {saveGroupsData} from "../localStorage/saveMethods";

/**
 * Records an edit to the currently selected verse in the target bible.
 *
 * @deprecated use {@link editTargetVerse} instead.
 *
 * @param {string} before - Previous text version of the verse.
 * @param {string} after - New edited text version of the verse.
 * @param {string[]} tags - Array of tags used for verse Edit check boxes.
 * @param {string|null} [username=null] - The user's alias. If null the current username will be used.
 * @return {Function}
 */
export const editSelectedTargetVerse = (before, after, tags, username=null) => {
  return (dispatch, getState) => {
    const contextId = getState().contextIdReducer.contextId;
    let {chapter, verse} = contextId.reference;
    dispatch(editTargetVerse(chapter, verse, before, after, tags, username));
  };
};

/**
 * save verse edit in translationWords to file system
 * @param {{
      verseBefore: String,
      verseAfter: String,
      tags: Array,
      userName: String,
      activeBook: String,
      activeChapter: Number,
      activeVerse: Number,
      modifiedTimestamp: String,
      gatewayLanguageCode: String,
      gatewayLanguageQuote: String,
      contextId: Object
    }} verseEdit - record that is saved to file system
 * @return {Function}
 */
export const writeTranslationWordsVerseEditToFile = (verseEdit) => {
  return (dispatch, getState) => {
    verseEdit.gatewayLanguageQuote = verseEdit.gatewayLanguageQuote || "";
    const {projectSaveLocation} = getState().projectDetailsReducer;
    const newFilename = verseEdit.modifiedTimestamp + '.json';
    const verseEditsPath = path.join(projectSaveLocation, '.apps', 'translationCore', 'checkData', 'verseEdits',
      verseEdit.activeBook, verseEdit.contextId.reference.chapter.toString(),
      verseEdit.contextId.reference.verse.toString());
    fs.ensureDirSync(verseEditsPath);
    fs.outputJSONSync(path.join(verseEditsPath, newFilename.replace(/[:"]/g, '_')), verseEdit);
  };
};

/**
 * processed batched groups actions
 * @param {Array} actionsBatch - array populate with verse edits to be batched
 * @return {Function}
 */
export const processGroupDataBatch = (actionsBatch) => {
  return async (dispatch, getState) => {
    if (actionsBatch.length) {
      const old_state = getState();
      console.log(`processGroupDataBatch() processing group batch, count=${actionsBatch.length}`);
      await delay(500);
      dispatch(batchActions(actionsBatch));
      console.log(`processGroupDataBatch() finished group batch, saving`);
      await delay(500);
      saveGroupsData(getState(), old_state);
      console.log("processGroupDataBatch() - saving is finished");
    }
  };
};

/**
 * batch setting verse edit flags for all tw checks in verse if not set
 * @param {Object} state - current state
 * @param {Object} contextId - of verse edit
 * @param {Array} actionsBatch - array append with verse edits to be batched
 */
export const getVerseEditsInTwGroupData = (state, contextId, actionsBatch) => {
  // in group data reducer set verse edit flag for every check of the verse edited
  const matchedGroupData = getGroupDataForVerse(state, contextId);
  const keys = Object.keys(matchedGroupData);
  let changedCount = 0;
  if (keys.length) {
    for (let i = 0, l = keys.length; i < l; i++) {
      const groupItem = matchedGroupData[keys[i]];
      if (groupItem) {
        for (let j = 0, lenGI = groupItem.length; j < lenGI; j++) {
          const check = groupItem[j];
          if (!check.verseEdits) { // only set if not yet set
            actionsBatch.push({
              type: types.TOGGLE_VERSE_EDITS_IN_GROUPDATA,
              contextId: check.contextId
            });
            changedCount++;
          }
        }
      }
    }
    if (changedCount) {
      console.log(`getVerseEditsInTwGroupData() chapter=${contextId.reference.chapter}, verse=${contextId.reference.verse}, keys=${keys.length}, changedCount=${changedCount}`);
    }
  }
};

/**
 * set verse edit flag for all tw checks in verse if not set
 * @param {Array} twVerseEdits - of verse edit contextIds
 * @return {Function}
 */
export const setVerseEditsInTwGroupDataFromArray = (twVerseEdits) => {
  return async (dispatch, getState) => {
    if (twVerseEdits && twVerseEdits.length) {
      const state = getState();
      const actionsBatch = [];
      for (let i = 0, lenVE = twVerseEdits.length; i < lenVE; i++) {
        const contextId = twVerseEdits[i];
        getVerseEditsInTwGroupData(state, contextId, actionsBatch);
      }
      if (actionsBatch.length) {
        dispatch(processGroupDataBatch(actionsBatch));
      }
    }
  };
};

/**
 * after a delay it starts updating the verse edit flags.  There are also delays between operations
 *   so we don't slow down UI interactions of user
 * @param {{
      verseBefore: String,
      verseAfter: String,
      tags: Array,
      userName: String,
      activeBook: String,
      activeChapter: Number,
      activeVerse: Number,
      modifiedTimestamp: String,
      gatewayLanguageCode: String,
      gatewayLanguageQuote: String,
      contextId: Object
    }} verseEdit - record to be saved to file system if in WA tool
 * @param {Object} contextIdWithVerseEdit - contextId of verse being edited
 * @param {Object} currentCheckContextId - contextId of group menu item selected
 * @return {Function}
 */
export const doBackgroundVerseEditsUpdates = (verseEdit, contextIdWithVerseEdit,
                                              currentCheckContextId) => {
  return async(dispatch, getState) => {
    console.log("doBackgroundVerseEditsUpdates() - recordTargetVerseEdit");
    await delay(1000); // wait till before updating
    const chapterWithVerseEdit = contextIdWithVerseEdit.reference.chapter;
    const verseWithVerseEdit = contextIdWithVerseEdit.reference.verse;
    dispatch(recordTargetVerseEdit(verseEdit.activeBook, chapterWithVerseEdit, verseWithVerseEdit,
      verseEdit.verseBefore, verseEdit.verseAfter, verseEdit.tags, verseEdit.userName, generateTimestamp(),
      verseEdit.gatewayLanguageCode, verseEdit.gatewayLanguageQuote, currentCheckContextId));
    await delay(200);

    const state = getState();
    if (getSelectedToolName(state) === 'translationWords') {
      const actionsBatch = [];
      getVerseEditsInTwGroupData(state, contextIdWithVerseEdit, actionsBatch);
      dispatch(processGroupDataBatch(actionsBatch));
      console.log("doBackgroundVerseEditsUpdates() - getVerseEditsInTwGroupData() is finished");
    }
  };
};

/**
 * updates verse edit in group data reducer (and in file system if tw group data is not loaded) and
 *   then does alignment validation checking
 *
 * @param {{
      verseBefore: String,
      verseAfter: String,
      tags: Array,
      userName: String,
      activeBook: String,
      activeChapter: Number,
      activeVerse: Number,
      modifiedTimestamp: String,
      gatewayLanguageCode: String,
      gatewayLanguageQuote: String,
      contextId: Object
    }} verseEdit - record to be saved to file system if in WA tool
 * @param {Object} contextIdWithVerseEdit - contextId of verse being edited
 * @param {Object} currentCheckContextId - contextId of group menu item selected
 * @param {Boolean} showSelectionInvalidated - if true then show prompt that selections invalidated
 * @return {Function}
 */
export const updateVerseEditStatesAndCheckAlignments = (verseEdit, contextIdWithVerseEdit,
                                                        currentCheckContextId, showSelectionInvalidated) => {
  return async (dispatch, getState) => {
    const translate = getTranslate(getState());
    dispatch(AlertModalActions.openAlertDialog(translate("tools.invalidation_checking"), true));
    await delay(500);
    const chapterWithVerseEdit = contextIdWithVerseEdit.reference.chapter;
    const verseWithVerseEdit = contextIdWithVerseEdit.reference.verse;
    console.log("updateVerseEditStatesAndCheckAlignments() - calling updateTargetVerse");
    dispatch(updateTargetVerse(chapterWithVerseEdit, verseWithVerseEdit, verseEdit.verseAfter));

    if (getSelectedToolName(getState()) === 'wordAlignment') {
      // since tw group data is not loaded into reducer, need to save verse edit record directly to file system
      dispatch(writeTranslationWordsVerseEditToFile(verseEdit));
      // in group data reducer set verse edit flag for the verse edited
      dispatch({
        type: types.TOGGLE_VERSE_EDITS_IN_GROUPDATA,
        contextId: contextIdWithVerseEdit
      });
    }

    // TRICKY: this is a temporary hack to validate verse edits.
    // TODO: This can be removed once the ScripturePane is updated to provide
    // callbacks for editing so that tools can manually perform the edit and
    // trigger validation on the specific verse.
    const newState = getState();
    const apis = getSupportingToolApis(newState);
    console.log("updateVerseEditStatesAndCheckAlignments() - calling api.validateVerse");
    if ('wordAlignment' in apis && apis['wordAlignment'] !== null) {
      // for other tools
      apis['wordAlignment'].trigger('validateVerse', chapterWithVerseEdit, verseWithVerseEdit);
    } else {
      // for wA
      const api = getSelectedToolApi(newState);
      if (api !== null &&
          (verseEdit.activeChapter !== chapterWithVerseEdit || verseEdit.activeVerse !== verseWithVerseEdit)) {
        api.trigger('validateVerse', chapterWithVerseEdit, verseWithVerseEdit);
      }
    }
    console.log("updateVerseEditStatesAndCheckAlignments() - api.validateVerse - done");
    if (showSelectionInvalidated) {
      dispatch(showSelectionsInvalidatedWarning()); // no need to close alert, since this replaces it
      await delay(1000);
    } else {
      dispatch(AlertModalActions.closeAlertDialog());
    }
    dispatch(doBackgroundVerseEditsUpdates(verseEdit, contextIdWithVerseEdit,
                                           currentCheckContextId));
  };
};

/**
 * This is a called by tool when a verse has been edited.  It updates group data reducer for current tool
 *   and updates file system for tools not loaded.
 * This will first do TW selections validation and prompt user if invalidations are found.
 * Then it calls updateVerseEditStatesAndCheckAlignments to saving verse edits and then validate alignments.
 *
 * @param {int} chapterWithVerseEdit
 * @param {int|string} verseWithVerseEdit
 * @param {string} before - the verse text before the edit
 * @param {string} after - the verse text after the edit
 * @param {string[]} tags - an array of tags indicating the reason for the edit
 * @param {string|null} username - The user's alias. If null the current username will be used.
 */
export const editTargetVerse = (chapterWithVerseEdit, verseWithVerseEdit, before, after, tags, username = null) => {
  return async (dispatch, getState) => {
    const {
      contextIdReducer
    } = getState();
    const {contextId: currentCheckContextId} = contextIdReducer;
    const { gatewayLanguageCode, gatewayLanguageQuote } = gatewayLanguageHelpers.getGatewayLanguageCodeAndQuote(getState());
    let {bookId, chapter: currentCheckChapter, verse: currentCheckVerse} = currentCheckContextId.reference;
    verseWithVerseEdit = (typeof verseWithVerseEdit === 'string') ? parseInt(verseWithVerseEdit) : verseWithVerseEdit; // make sure number
    const contextIdWithVerseEdit = {
      ...currentCheckContextId,
      reference: {
        ...currentCheckContextId.reference,
        chapter: chapterWithVerseEdit,
        verse: verseWithVerseEdit
      }
    };
    // fallback to the current username
    let userAlias = username;
    if(userAlias === null) {
      userAlias = getUsername(getState());
    }
    const selectionsValidationResults = {};
    console.log("editTargetVerse() - calling validateSelections()");
    dispatch(validateSelections(after, contextIdWithVerseEdit, chapterWithVerseEdit, verseWithVerseEdit,
      false, selectionsValidationResults));
    console.log("editTargetVerse() - validateSelections() - done");

    // create verse edit record to write to file system
    const modifiedTimestamp = generateTimestamp();
    const verseEdit = {
      verseBefore: before,
      verseAfter: after,
      tags,
      userName: userAlias,
      activeBook: bookId,
      activeChapter: currentCheckChapter,
      activeVerse: currentCheckVerse,
      modifiedTimestamp: modifiedTimestamp,
      gatewayLanguageCode,
      gatewayLanguageQuote,
      contextId: contextIdWithVerseEdit
    };

    dispatch(updateVerseEditStatesAndCheckAlignments(verseEdit, contextIdWithVerseEdit, currentCheckContextId,
        selectionsValidationResults.selectionsChanged));
  };
};

/**
 * Records an edit to a verse in the target language bible.
 * This will result in the verse text being written to the disk.
 * This is closely related to {@link updateTargetVerse}.
 *
 * @param {string} bookId - the id of the book receiving the edit
 * @param {int} chapter - the chapter receiving the edit
 * @param {int} verse - the verse that was edited
 * @param {string} before - the verse text before the edit
 * @param {string} after - the verse text after the edit
 * @param {string[]} tags - an array of tags indicating the reason for the edit
 * @param {string} username - the current user's username
 * @param {string} modified - the edit timestamp
 * @param {string|null} [glCode=null] - the gateway language code
 * @param {string|null} [glQuote=null] - the gateway language code
 * @return {Object} - record to save to file
 */
export const recordTargetVerseEdit = (bookId, chapter, verse, before, after, tags, username, modified, glCode=null, glQuote=null,
  {reference:{chapter:activeChapter, verse:activeVerse}, quote, groupId, occurrence}) => ({
  type: types.ADD_VERSE_EDIT,
  before,
  after,
  tags,
  username,
  activeBook: bookId,
  activeChapter,
  activeVerse,
  modifiedTimestamp: modified,
  gatewayLanguageCode: glCode,
  gatewayLanguageQuote: glQuote,
  reference: {
    bookId,
    chapter: parseInt(chapter),
    verse: parseInt(verse),
    groupId
  },
  quote,
  occurrence
});

/**
 * Updates the verse text in the target language bible resource.
 * This will not write any changes to the disk.
 * @param {int} chapter
 * @param {int} verse
 * @param {string} text
 * @return {*}
 */
export const updateTargetVerse = (chapter, verse, text) => ({
  type: types.UPDATE_TARGET_VERSE,
  editedText: text,
  chapter,
  verse
});
