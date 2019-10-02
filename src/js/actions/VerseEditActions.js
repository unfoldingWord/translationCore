/* eslint-disable require-await */
import path from 'path-extra';
import fs from 'fs-extra';
// actions
import { batchActions } from 'redux-batched-actions';
// helpers
import { generateTimestamp } from '../helpers/index';
import * as gatewayLanguageHelpers from '../helpers/gatewayLanguageHelpers';
import { delay } from '../common/utils';
import {
  getSelectedToolApi,
  getSelectedToolName,
  getSupportingToolApis,
  getTranslate,
  getUsername,
} from '../selectors';
import {
  WORD_ALIGNMENT, TRANSLATION_WORDS, TRANSLATION_NOTES,
} from '../common/constants';
import * as AlertModalActions from './AlertModalActions';
import {
  getGroupDataForVerse, showInvalidatedWarnings, validateSelections,
} from './SelectionsActions';
import types from './ActionTypes';

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
export const writeTranslationWordsVerseEditToFile = (verseEdit) => (dispatch, getState) => {
  verseEdit.gatewayLanguageQuote = verseEdit.gatewayLanguageQuote || '';
  const { projectSaveLocation } = getState().projectDetailsReducer;
  const newFilename = verseEdit.modifiedTimestamp + '.json';
  const verseEditsPath = path.join(projectSaveLocation, '.apps', 'translationCore', 'checkData', 'verseEdits',
    verseEdit.activeBook, verseEdit.contextId.reference.chapter.toString(),
    verseEdit.contextId.reference.verse.toString());
  fs.ensureDirSync(verseEditsPath);
  fs.outputJSONSync(path.join(verseEditsPath, newFilename.replace(/[:"]/g, '_')), verseEdit);
};

/**
 * batch setting verse edit flags for all tw checks in verse if not set
 * @param {Object} state - current state
 * @param {Object} contextId - of verse edit
 * @param {Object} editedChecks - gets loaded with verse edits indexed by groupId
 */
export const getCheckVerseEditsInGroupData = (state, contextId, editedChecks) => {
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

            if (!editedChecks[groupId]) {
              editedChecks[groupId] = [];
            }
            editedChecks[groupId].push({
              type: types.TOGGLE_VERSE_EDITS_IN_GROUPDATA,
              contextId: check.contextId,
            });
          }
        }
      }
    }
  }
};

/**
 * populates batch and optimizes by combining multiple edits for a groupID
 * @param {Object} editedChecks - gets loaded with verse edits indexed by groupId
 * @param {Array} actionBatch - will be populated with verse edit actions
 * @return {{groupIds: Array, groupEditsCount: Number}}
 */
export const editChecksToBatch = (editedChecks, actionBatch) => {
  const groupIds = Object.keys(editedChecks);
  let groupEditsCount = 0;

  // process by group
  for (let j = 0, l = groupIds.length; j < l; j++) {
    const groupId = groupIds[j];
    const verseEdits = editedChecks[groupId];

    if (verseEdits.length === 1) { // if only one, then don't need to combine
      actionBatch.push(verseEdits[0]); // batch the only verse edit
      groupEditsCount += 1;
    } else { // combine multiple verse edits into one call
      const references = verseEdits.map(item => (item.contextId.reference)); // just get all the references to change

      actionBatch.push({
        type: types.TOGGLE_MULTIPLE_VERSE_EDITS_IN_GROUPDATA,
        groupId,
        references,
      });
      groupEditsCount += references.length;
    }
  }
  return { groupIds, groupEditsCount };
};

/**
 * make sure verse edit flag is set for all tw checks in verses
 * @param {Object} twVerseEdits - indexed by verse - contextIds for each verse edit
 * @return {Function}
 */
export const ensureCheckVerseEditsInGroupData = (twVerseEdits) => async (dispatch, getState) => {
  const versesEdited = Object.keys(twVerseEdits);

  if (versesEdited && versesEdited.length) {
    const state = getState();
    const editedChecks = {};

    for (let i = 0, lenVE = versesEdited.length; i < lenVE; i++) {
      const contextId = twVerseEdits[versesEdited[i]];
      getCheckVerseEditsInGroupData(state, contextId, editedChecks);
    }

    const actionBatch = [];
    const { groupIds, groupEditsCount } = editChecksToBatch(editedChecks, actionBatch);

    if (actionBatch.length) {
      const translate = getTranslate(getState());
      dispatch(AlertModalActions.openAlertDialog(translate('loading_verse_edits'), true));
      await delay(400);
      console.log('ensureCheckVerseEditsInGroupData() - edited verses=' + versesEdited.length);
      dispatch(batchActions(actionBatch));
      console.log('ensureCheckVerseEditsInGroupData() - total checks changed=' + groupEditsCount);
      console.log('ensureCheckVerseEditsInGroupData() - batch finished, groupId\'s edited=' + groupIds.length);
      dispatch(AlertModalActions.closeAlertDialog());
    }
  }
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
  currentCheckContextId, batchGroupData) => async (dispatch, getState) => {
  const chapterWithVerseEdit = contextIdWithVerseEdit.reference.chapter;
  const verseWithVerseEdit = contextIdWithVerseEdit.reference.verse;

  dispatch(recordTargetVerseEdit(verseEdit.activeBook, chapterWithVerseEdit, verseWithVerseEdit,
    verseEdit.verseBefore, verseEdit.verseAfter, verseEdit.tags, verseEdit.userName, generateTimestamp(),
    verseEdit.gatewayLanguageCode, verseEdit.gatewayLanguageQuote, currentCheckContextId));

  const actionsBatch = Array.isArray(batchGroupData) ? batchGroupData : []; // if batch array passed in then use it, otherwise create new array
  const state = getState();
  const toolName = getSelectedToolName(state);

  if (toolName === TRANSLATION_WORDS || toolName === TRANSLATION_NOTES) {
    const editedChecks = {};
    getCheckVerseEditsInGroupData(state, contextIdWithVerseEdit, editedChecks);
    const { groupEditsCount } = editChecksToBatch(editedChecks, actionsBatch); // optimize edits into batch

    if (groupEditsCount) {
      console.log(`doBackgroundVerseEditsUpdates() - ${groupEditsCount} group edits found`);
    }
  }
  dispatch(batchActions(actionsBatch));
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
  batchGroupData = null) => async (dispatch, getState) => {
  const translate = getTranslate(getState());
  const actionsBatch = Array.isArray(batchGroupData) ? batchGroupData : []; // if batch array passed in then use it, otherwise create new array
  dispatch(AlertModalActions.openAlertDialog(translate('tools.invalidation_checking'), true));
  await delay(1000);
  const chapterWithVerseEdit = contextIdWithVerseEdit.reference.chapter;
  const verseWithVerseEdit = contextIdWithVerseEdit.reference.verse;
  dispatch(updateTargetVerse(chapterWithVerseEdit, verseWithVerseEdit, verseEdit.verseAfter));

  if (getSelectedToolName(getState()) === WORD_ALIGNMENT) {
    // since tw group data is not loaded into reducer, need to save verse edit record directly to file system
    dispatch(writeTranslationWordsVerseEditToFile(verseEdit));
    // in group data reducer set verse edit flag for the verse edited
    dispatch({
      type: types.TOGGLE_VERSE_EDITS_IN_GROUPDATA,
      contextId: contextIdWithVerseEdit,
    });
  }

  let showAlignmentsInvalidated = false;

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
  dispatch(AlertModalActions.closeAlertDialog());

  if (showSelectionInvalidated || showAlignmentsInvalidated) {
    dispatch(showInvalidatedWarnings(showSelectionInvalidated, showAlignmentsInvalidated));
  }
  dispatch(doBackgroundVerseEditsUpdates(verseEdit, contextIdWithVerseEdit,
    currentCheckContextId, actionsBatch));
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
 */
export const editTargetVerse = (chapterWithVerseEdit, verseWithVerseEdit, before, after, tags) => async (dispatch, getState) => {
  const state = getState();
  const username = state.loginReducer.userdata.username;
  const { contextId: currentCheckContextId } = state.contextIdReducer;
  const { gatewayLanguageCode, gatewayLanguageQuote } = gatewayLanguageHelpers.getGatewayLanguageCodeAndQuote(getState());
  let {
    bookId, chapter: currentCheckChapter, verse: currentCheckVerse,
  } = currentCheckContextId.reference;
  verseWithVerseEdit = (typeof verseWithVerseEdit === 'string') ? parseInt(verseWithVerseEdit) : verseWithVerseEdit; // make sure number

  const contextIdWithVerseEdit = {
    ...currentCheckContextId,
    reference: {
      ...currentCheckContextId.reference,
      chapter: chapterWithVerseEdit,
      verse: verseWithVerseEdit,
    },
  };
    // fallback to the current username
  let userAlias = username;

  if (userAlias === null) {
    userAlias = getUsername(getState());
  }

  const selectionsValidationResults = {};
  const actionsBatch = [];

  dispatch(validateSelections(after, contextIdWithVerseEdit, chapterWithVerseEdit, verseWithVerseEdit,
    false, selectionsValidationResults, actionsBatch));

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
    contextId: contextIdWithVerseEdit,
  };

  dispatch(updateVerseEditStatesAndCheckAlignments(verseEdit, contextIdWithVerseEdit, currentCheckContextId,
    selectionsValidationResults.selectionsChanged, actionsBatch));
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
  {
    reference:{ chapter:activeChapter, verse:activeVerse }, quote, groupId, occurrence,
  }) => ({
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
    groupId,
  },
  quote,
  occurrence,
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
  verse,
});
