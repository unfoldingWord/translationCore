/* eslint-disable no-console */

import * as AlertModalActions from './AlertModalActions';
import * as WordAlignmentHelpers from '../helpers/WordAlignmentHelpers';
import * as manifestHelpers from '../helpers/manifestHelpers';
import * as USFMExportActions from './USFMExportActions';

/**
 * Wrapper for exporting project alignment data to usfm.
 * @param {string} projectSaveLocation - Full path to the users project to be exported
 * @param {boolean} output - Flag to set whether export will write to fs
 * @param {boolean} resetAlignments - Flag to set whether export will reset alignments
 * automatically or ask user
 */
export const getUsfm3ExportFile = (projectSaveLocation, output = false, resetAlignments = false) => {
  return dispatch => {
    return new Promise(async (resolve, reject) => {
      //Get path for alignment conversion
      const {wordAlignmentDataPath, projectTargetLanguagePath, chapters} = WordAlignmentHelpers.getAlignmentPathsFromProject(projectSaveLocation);
      const manifest = manifestHelpers.getProjectManifest(projectSaveLocation);
      /** Convert alignments from the filesystem under then project alignments folder */
      let usfm = await WordAlignmentHelpers.convertAlignmentDataToUSFM(
        wordAlignmentDataPath, projectTargetLanguagePath, chapters, projectSaveLocation, manifest.project.id
      ).catch(async (e) => {
        if (e && e.error && e.error.type === 'InvalidatedAlignments') {
          //error in converting alignment need to prompt user to fix
          const {chapter, verse} = e;
          let res;
          if (resetAlignments) {
            res = 'Export';
          } else {
            res = await dispatch(displayAlignmentErrorsPrompt(projectSaveLocation, chapter, verse));
            /** The flag output indicates that it is a silent upload */
            if (!output) dispatch(USFMExportActions.displayLoadingUSFMAlert(manifest));
          }
          if (res === 'Export') {
            //The user chose to continue and reset the alignments
            await WordAlignmentHelpers.resetAlignmentsForVerse(projectSaveLocation, chapter, verse);
            usfm = await dispatch(getUsfm3ExportFile(projectSaveLocation, output, true));
            resolve(usfm);
          } else {
            reject();
          }
        } else console.error(e);
      });
      //Write converted usfm to specified location
      if (output) WordAlignmentHelpers.writeToFS(output, usfm);
      /** The flag output indicates that it is a silent upload */
      if (!output) dispatch(AlertModalActions.closeAlertDialog());
      resolve(usfm);
    });
  };
};

export function displayAlignmentErrorsPrompt() {
  return ((dispatch) => {
    return new Promise((resolve) => {
      const alignmentErrorsPrompt = 'Some alignments have been invalidated! To fix the invalidated alignment,\
open the project in the Word Alignment Tool. If you proceed with the export, the alignment for these verses will be reset.';
      dispatch(AlertModalActions.openOptionDialog(
        alignmentErrorsPrompt,
        (res) => {
          dispatch(AlertModalActions.closeAlertDialog());
          resolve(res);
        },
        'Export',
        'Cancel'
      ));
    });
  });
}
