/* eslint-disable no-console */
/* eslint-disable no-async-promise-executor */
import * as WordAlignmentHelpers from '../helpers/WordAlignmentHelpers';
import * as manifestHelpers from '../helpers/manifestHelpers';
import * as exportHelpers from '../helpers/exportHelpers';
import { getTranslate } from '../selectors';
import { delay } from '../common/utils';
import * as USFMExportActions from './USFMExportActions';
import * as AlertModalActions from './AlertModalActions';

/**
 * Wrapper for exporting project alignment data to usfm.
 * TODO: the alignment to usfm conversion will eventually get abstracted to a separate module.
 * @param {string} projectSaveLocation - Full path to the users project to be exported
 * @param {boolean|string} output - Flag to set whether export will write to fs
 * @param {boolean} resetAlignments - Flag to set whether export will reset alignments
 * automatically or ask user
 */
export const getUsfm3ExportFile = (projectSaveLocation, output = false, resetAlignments = false) => (dispatch, getState) => new Promise(async (resolve, reject) => {
  console.info('getUsfm3ExportFile()');
  const translate = getTranslate(getState());
  // Get path for alignment conversion
  const {
    wordAlignmentDataPath, projectTargetLanguagePath, chapters,
  } = WordAlignmentHelpers.getAlignmentPathsFromProject(projectSaveLocation);
  const manifest = manifestHelpers.getProjectManifest(projectSaveLocation);
  exportHelpers.makeSureUsfm3InHeader(projectSaveLocation, manifest);
  // Convert alignments from the filesystem under the project alignments folder
  console.info('getUsfm3ExportFile: Saving Alignments to USFM');
  let usfm = null;

  try {
    usfm = await WordAlignmentHelpers.convertAlignmentDataToUSFM(
      wordAlignmentDataPath, projectTargetLanguagePath, chapters, projectSaveLocation, manifest.project.id);
  } catch (e) {
    if (e && e.error && e.error.type === 'InvalidatedAlignments') {
      console.info('Error converting alignment, prompting user to fix it.');
      // Error in converting alignment need to prompt user to fix
      const { chapter, verse } = e;
      let res;

      if (resetAlignments) {
        res = 'Export';
      } else {
        res = await dispatch(displayAlignmentErrorsPrompt(projectSaveLocation, chapter, verse));
        await delay(500);

        /** The flag output indicates that it is a silent upload */
        if (!output) {
          dispatch(USFMExportActions.displayLoadingUSFMAlert(manifest));
        }
      }

      if (res === 'Export') {
        const bookName = manifest.project ? manifest.project.name : null;
        const reference = bookName ? `${bookName} ${chapter}:${verse}` : '';
        dispatch(AlertModalActions.openAlertDialog(`${translate('resetting_alignments')} ${reference}`, true));
        console.info('getUsfm3ExportFile: Resetting Alignments');
        // The user chose to continue and reset the alignment
        await WordAlignmentHelpers.resetAlignmentsForVerse(projectSaveLocation, chapter, verse);
        usfm = await dispatch(getUsfm3ExportFile(projectSaveLocation, output, true));
      } else {
        console.error('getUsfm3ExportFile: Conversion Failed - invalid alignments', e);
        reject(e);
        return;
      }
    } else {
      console.error('getUsfm3ExportFile() - Error converting alignment data to USFM', e);
      reject(e);
      return;
    }
  }

  if (output) { /** output indicates that it is a silent upload */
    //Write converted usfm to specified location
    console.info('getUsfm3ExportFile: Writing Alignments to ' + output);
    WordAlignmentHelpers.writeToFS(output, usfm);
  } else {
    dispatch(AlertModalActions.closeAlertDialog());
  }
  console.info('getUsfm3ExportFile: Conversion Complete');
  resolve(usfm);
});

export function displayAlignmentErrorsPrompt() {
  return ((dispatch) => new Promise((resolve) => {
    const alignmentErrorsPrompt = 'Some alignments have been invalidated! To fix the invalidated alignment, open the project in the Word Alignment Tool. If you proceed with the export, the alignment for these verses will be reset.';

    dispatch(AlertModalActions.openOptionDialog(
      alignmentErrorsPrompt,
      (res) => {
        dispatch(AlertModalActions.closeAlertDialog());
        resolve(res);
      },
      'Export',
      'Cancel',
    ));
  }));
}
