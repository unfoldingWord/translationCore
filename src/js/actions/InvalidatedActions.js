import consts from './ActionTypes';
import isEqual from 'deep-equal';
import path from 'path-extra';
import fs from 'fs-extra';
import { checkSelectionOccurrences } from 'selections';
// Actions
import * as TargetLanguageActions from './TargetLanguageActions';
// helpers
import {generateTimestamp} from '../helpers/index';
import * as gatewayLanguageHelpers from '../helpers/gatewayLanguageHelpers';
import * as generatePathsUtil from '../common/generatePathsUtil';
import * as invalidatedCheckHelpers from '../helpers/invalidatedCheckHelpers';
// selectors
import {getUsername} from '../selectors';

/**
 * @description sets invalidatedReducer to true or false
 * @param {String} userName - The username of who invalidated.
 * @param {String} timestamp
 * @param {Boolean} invalidated - new state for invalidated flag
 * @return {object} action state.
 */
export function set(userName, timestamp, invalidated) {
  return ((dispatch, getState) => {
    const {
      gatewayLanguageCode,
      gatewayLanguageQuote
    } = gatewayLanguageHelpers.getGatewayLanguageCodeAndQuote(getState());

    dispatch({
      type: consts.SET_INVALIDATED,
      modifiedTimestamp: timestamp,
      gatewayLanguageCode,
      gatewayLanguageQuote,
      userName,
      invalidated
    });
  });
}

/**
 * @description sets invalidated to true or false in both invalidatedReducer and groupDataReducer
 * @param {String} username - The username of who invalidated.
 * @param {Boolean} invalidated - new state for invalidated flag
 * @return {object} action state.
 */
export const setInvalidated = (username, invalidated) => {
  return ((dispatch, getState) => {
    let state = getState();
    let contextId = state.contextIdReducer.contextId;

    dispatch(set(username, generateTimestamp(), invalidated));
    dispatch({
      type: consts.SET_INVALIDATION_IN_GROUPDATA,
      contextId,
      boolean: invalidated
    });
  });
};

export const getAllInvalidatedChecksForCurrentProject = () => {
  return ((dispatch, getState) => {
    const { projectSaveLocation, manifest: { project } } = getState().projectDetailsReducer;
    const bookAbbreviation = project.id;
    const invalidatedFolderPath = generatePathsUtil.getCheckDataFolderPath(projectSaveLocation, bookAbbreviation, 'invalidated');
    const verseEditFolderPath = generatePathsUtil.getCheckDataFolderPath(projectSaveLocation, bookAbbreviation, 'verseEdits');
    const verseEditsTotal = invalidatedCheckHelpers.getTotalOfEditedVerses(verseEditFolderPath);
    const invalidatedChecksTotal = invalidatedCheckHelpers.loadTotalOfInvalidatedChecksForCurrentProject(invalidatedFolderPath);
    const invalidatedAlignmentsTotal = invalidatedCheckHelpers.getTotalInvalidatedAlignments(projectSaveLocation, bookAbbreviation);

    dispatch({
      type: consts.SET_INVALIDATED_CHECKS_TOTAL,
      invalidatedChecksTotal
    });

    dispatch({
      type: consts.SET_VERSE_EDITS_TOTAL,
      verseEditsTotal
    });

    dispatch({
      type: consts.SET_INVALIDATED_ALIGNMENTS_TOTAL,
      invalidatedAlignmentsTotal
    });
  });
};

export const findInvalidatedSelectionsForAllCheckData = () => {
  return ((dispatch, getState) => {
    let state = getState();
    const projectPath = state.projectDetailsReducer.projectSaveLocation;
    const bookId = state.projectDetailsReducer.manifest.project.id;
    const selectionsPath = path.join(projectPath, '.apps', 'translationCore', 'checkData', 'selections', bookId);
    if (fs.existsSync(selectionsPath)) {
      let chapters = fs.readdirSync(selectionsPath);  
      for (let chapIdx in chapters) {
        let chapter = parseInt(chapters[chapIdx]);
        let chapterPath = path.join(selectionsPath, chapter.toString());
        dispatch(TargetLanguageActions.loadTargetLanguageChapter(chapter));
        state = getState();
        if (state.resourcesReducer && state.resourcesReducer.bibles && state.resourcesReducer.bibles.targetLanguage && state.resourcesReducer.bibles.targetLanguage.targetBible) {
          const bibleChapter = state.resourcesReducer.bibles.targetLanguage.targetBible[chapter];
          if (bibleChapter) {
            let verses = fs.readdirSync(chapterPath);
            for (let verseIdx in verses) {
              let verse = parseInt(chapters[verseIdx]);
              let versePath = path.join(chapterPath, verse.toString());
              const verseText = bibleChapter[verse];
              let files = fs.readdirSync(versePath);
              files = files.filter(file => { // filter the filenames to only use .json
                return path.extname(file) === '.json';
              });
              const sorted = files.sort().reverse(); // sort the files to use latest
              const done = {};
              for(let sortedIdx in sorted) {
                const filename = sorted[sortedIdx];
                const selectionsData = fs.readJsonSync(path.join(versePath, filename));
                const doneKey = selectionsData.contextId.tool + '-' + selectionsData.contextId.groupId + '-' + selectionsData.contextId.quote + '-' + selectionsData.contextId.occurrence;
                if ( ! done[doneKey]) {
                  const validSelections = checkSelectionOccurrences(verseText, selectionsData.selections);
                  if (!isEqual(selectionsData.selections, validSelections)) { // if true found invalidated check
                    const username = getUsername(state);
                    const modifiedTimestamp = generateTimestamp();
                    const invalidted = {
                      contextId: selectionsData.contextId,
                      invalidated: true,
                      userName: username,
                      modifiedTimestamp: modifiedTimestamp,
                      gatewayLanguageCode: selectionsData.gatewayLanguageCode,
                      gatewayLanguageQuote: selectionsData.gatewayLanguageQuote
                    };
                    const newFilename = modifiedTimestamp + '.json';
                    const invalidatedCheckPath = path.join(projectPath, '.apps', 'translationCore', 'checkData', 'invalidated', bookId, chapter.toString(), verse.toString());
                    fs.outputJSONSync(path.join(invalidatedCheckPath, newFilename.replace(/[:"]/g, '_')), invalidted);
                    done[doneKey] = true;
                  }
                }
              }
            }
          }
        }
      }
    }
  });
};
