import path from "path-extra";
import fs from "fs-extra";
import types from './ActionTypes';
// actions
import {getGroupDataForVerse, showInvalidatedWarnings, validateSelections} from "./SelectionsActions";
import * as AlertModalActions from "./AlertModalActions";
import {batchActions} from "redux-batched-actions";
// helpers
import {generateTimestamp} from '../helpers/index';
import * as gatewayLanguageHelpers from '../helpers/gatewayLanguageHelpers';
import {delay} from "../common/utils";
import {
  getSelectedToolApi,
  getSelectedToolName,
  getSupportingToolApis,
  getTranslate,
  getUsername
} from '../selectors';
import { WORD_ALIGNMENT, TRANSLATION_WORDS, TRANSLATION_NOTES } from '../common/constants';

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
 * batch setting verse edit flags for all tw checks in verse if not set
 * @param {Object} state - current state
 * @param {Object} contextId - of verse edit
 * @param {Object} actionsBatch - gets loaded with verse edits to be batched (indexed by groupId)
 */
export const getCheckVerseEditsInGroupData = (state, contextId, actionsBatch) => {
  // in group data reducer set verse edit flag for every check of the verse edited
  const matchedGroupData = getGroupDataForVerse(state, contextId);
  const keys = Object.keys(matchedGroupData);
  if (keys.length) {
    for (let i = 0, l = keys.length; i < l; i++) {
      const groupItem = matchedGroupData[keys[i]];
      if (groupItem) {
        for (let j = 0, lenGI = groupItem.length; j < lenGI; j++) {
          const check = groupItem[j];
          if (!check.verseEdits) { // only set if not yet set
            const groupId = check.contextId.groupId;
            if (!actionsBatch[groupId]) {
              actionsBatch[groupId] = [];
            }
            actionsBatch[groupId].push({
              type: types.TOGGLE_VERSE_EDITS_IN_GROUPDATA,
              contextId: check.contextId
            });
          }
        }
      }
    }
  }
};

/**
 * make sure verse edit flag is set for all tw checks in verses
 * @param {Object} twVerseEdits - indexed by verse - contextIds for each verse edit
 * @return {Function}
 */
export const ensureCheckVerseEditsInGroupData = (twVerseEdits) => {
  return async (dispatch, getState) => {
    await delay(400);
    const versesEdited = Object.keys(twVerseEdits);
    if (versesEdited && versesEdited.length) {
      const state = getState();
      const editedChecks = {};
      for (let i = 0, lenVE = versesEdited.length; i < lenVE; i++) {
        const contextId = twVerseEdits[versesEdited[i]];
        getCheckVerseEditsInGroupData(state, contextId, editedChecks);
      }
      const batch = [];
      if (editedChecks) {
        const groupIds = Object.keys(editedChecks);
        let count = 0;
        // process by group
        for (let j = 0, l = groupIds.length; j < l; j++) {
          const groupId = groupIds[j];
          const verseEdits = editedChecks[groupId];
          if (verseEdits.length === 1) { // if only one, then don't need to combine
            batch.push(verseEdits[0]); // batch the only verse edit
            count += 1;
          } else { // combine multiple verse edits into one call
            const references = verseEdits.map(item => (item.contextId.reference)); // just get all the references to change
            batch.push({
              type: types.TOGGLE_MULTIPLE_VERSE_EDITS_IN_GROUPDATA,
              groupId,
              references
            });
            count += references.length;
          }
        }
        if (batch.length) {
          const translate = getTranslate(getState());
          dispatch(AlertModalActions.openAlertDialog(translate("loading_verse_edits"), true));
          await delay(400);
          console.log("ensureCheckVerseEditsInGroupData() - edited verses=" + versesEdited.length);
          dispatch(batchActions(batch));
          console.log("ensureCheckVerseEditsInGroupData() - total checks changed=" + count);
          console.log("ensureCheckVerseEditsInGroupData() - batch finished, groupId's edited=" + groupIds.length);
          dispatch(AlertModalActions.closeAlertDialog());
        }
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
 * @param {Array|null} batchGroupData - if present then add group data actions to this array for later batch operation
 * @return {Function}
 */
export const doBackgroundVerseEditsUpdates = (verseEdit, contextIdWithVerseEdit,
                                              currentCheckContextId, batchGroupData) => {
  return async(dispatch, getState) => {
    const chapterWithVerseEdit = contextIdWithVerseEdit.reference.chapter;
    const verseWithVerseEdit = contextIdWithVerseEdit.reference.verse;
    dispatch(recordTargetVerseEdit(verseEdit.activeBook, chapterWithVerseEdit, verseWithVerseEdit,
      verseEdit.verseBefore, verseEdit.verseAfter, verseEdit.tags, verseEdit.userName, generateTimestamp(),
      verseEdit.gatewayLanguageCode, verseEdit.gatewayLanguageQuote, currentCheckContextId));

    const actionsBatch = Array.isArray(batchGroupData) ? batchGroupData  : []; // if batch array passed in then use it, otherwise create new array
    const state = getState();
    const toolName = getSelectedToolName(state);
    if (toolName === TRANSLATION_WORDS || toolName === TRANSLATION_NOTES) {
      getCheckVerseEditsInGroupData(state, contextIdWithVerseEdit, actionsBatch);
    }
    dispatch(batchActions(actionsBatch));
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
 * @param {Array|null} batchGroupData - if present then add group data actions to this array for later batch operation
 * @return {Function}
 */
export const updateVerseEditStatesAndCheckAlignments = (verseEdit, contextIdWithVerseEdit,
                                                        currentCheckContextId, showSelectionInvalidated,
                                                        batchGroupData = null) => {
  return async (dispatch, getState) => {
    const translate = getTranslate(getState());
    const actionsBatch = Array.isArray(batchGroupData) ? batchGroupData  : []; // if batch array passed in then use it, otherwise create new array
    dispatch(AlertModalActions.openAlertDialog(translate("tools.invalidation_checking"), true));
    await delay(500);
    const chapterWithVerseEdit = contextIdWithVerseEdit.reference.chapter;
    const verseWithVerseEdit = contextIdWithVerseEdit.reference.verse;
    var t4 = performance.now();
    dispatch(updateTargetVerse(chapterWithVerseEdit, verseWithVerseEdit, verseEdit.verseAfter));
    var t5 = performance.now();
    //console.log("Call to updateTargetVerse took " + (t5 - t4) + " milliseconds.");

    if (getSelectedToolName(getState()) === WORD_ALIGNMENT) {
      // since tw group data is not loaded into reducer, need to save verse edit record directly to file system
      dispatch(writeTranslationWordsVerseEditToFile(verseEdit));
      // in group data reducer set verse edit flag for the verse edited
      dispatch({
        type: types.TOGGLE_VERSE_EDITS_IN_GROUPDATA,
        contextId: contextIdWithVerseEdit
      });
    }
    let showAlignmentsInvalidated = false;
    var t6 = performance.now();
    // TRICKY: this is a temporary hack to validate verse edits.
    // TODO: This can be removed once the ScripturePane is updated to provide
    // callbacks for editing so that tools can manually perform the edit and
    // trigger validation on the specific verse.
    const newState = getState();
    const apis = getSupportingToolApis(newState);
    if (WORD_ALIGNMENT in apis && apis[WORD_ALIGNMENT] !== null) {
      // for other tools
      showAlignmentsInvalidated = !apis[WORD_ALIGNMENT].trigger('validateVerse',
                                                                  chapterWithVerseEdit, verseWithVerseEdit, true);
    } else {
      // for wA
      const api = getSelectedToolApi(newState);
      if (api !== null) {
        showAlignmentsInvalidated = !api.trigger('validateVerse',
                                                  chapterWithVerseEdit, verseWithVerseEdit, true);
      }
    }
    var t7 = performance.now();
    //console.log("Call to validateVerse took " + (t7 - t6) + " milliseconds.");
    dispatch(AlertModalActions.closeAlertDialog());
    if (showSelectionInvalidated || showAlignmentsInvalidated) {
      await delay(250);
      dispatch(showInvalidatedWarnings(showSelectionInvalidated, showAlignmentsInvalidated));
      await delay(1000);
    }
    var t8 = performance.now();
    await dispatch(doBackgroundVerseEditsUpdates(verseEdit, contextIdWithVerseEdit,
                                           currentCheckContextId, actionsBatch));
    var t9 = performance.now();
    //console.log("Call to doBackgroundVerseEditsUpdates took " + (t9 - t8) + " milliseconds.");
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
    debugger;
    var t_main_start = performance.now();
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
    const actionsBatch = [];
    var t0 = performance.now();
    dispatch(validateSelections(after, contextIdWithVerseEdit, chapterWithVerseEdit, verseWithVerseEdit,
      false, selectionsValidationResults, actionsBatch));
    var t1 = performance.now();
    //console.log("Call to validateSelections took " + (t1 - t0) + " milliseconds.");
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
    await dispatch(updateVerseEditStatesAndCheckAlignments(verseEdit, contextIdWithVerseEdit, currentCheckContextId,
      selectionsValidationResults.selectionsChanged, actionsBatch));
    var t_main_end = performance.now();
    console.log("Took " + (t_main_end - t_main_start) + " milliseconds to process verse edit.");
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
