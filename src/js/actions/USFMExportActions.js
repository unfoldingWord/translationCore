import consts from './ActionTypes';
import usfm from 'usfm-parser';
import * as fs from 'fs-extra';
import Path from 'path-extra';
import * as LoadHelpers from '../helpers/LoadHelpers';
import * as AlertModalActions from './AlertModalActions';
const ipcRenderer = require('electron').ipcRenderer;
const OSX_DOCUMENTS_PATH = Path.join(Path.homedir(), 'Documents');
const WIN_DOCUMENTS_PATH = Path.join(Path.homedir(), 'My Documents');

export function exportToUSFM(projectPath) {
  return ((dispatch, getState) => {
    try {
      let defaultPath;
      let projectName = Path.parse(projectPath).base;
      const usfmSaveLocation = getState().settingsReducer.usfmSaveLocation;
      if (usfmSaveLocation) {
        defaultPath = Path.join(usfmSaveLocation, projectName + '.usfm');
      }
      else if (fs.existsSync(OSX_DOCUMENTS_PATH)) {
        defaultPath = Path.join(OSX_DOCUMENTS_PATH, projectName + '.usfm');
      } else if (fs.existsSync(WIN_DOCUMENTS_PATH)) {
        defaultPath = Path.join(WIN_DOCUMENTS_PATH, projectName + '.usfm');
      }
      else {
        defaultPath = Path.join(Path.homedir(), projectName + '.usfm');
      }
      let filePath = ipcRenderer.sendSync('save-as', { options: { defaultPath: defaultPath, filters: [{ extensions: ['usfm'] }], title: 'Save USFM Export As' } });
      projectName = Path.parse(filePath).base.replace('.usfm', '');
      if (!filePath) {
        dispatch(AlertModalActions.openAlertDialog('Export Cancelled', false));
        return;
      } else {
        dispatch({ type: consts.SET_USFM_SAVE_LOCATION, usfmSaveLocation: filePath.split(projectName)[0] })
      }
      dispatch(AlertModalActions.openAlertDialog("Exporting " + projectName + " Please wait...", true));

      let usfmJSONObject = {};

      let manifest = LoadHelpers.loadFile(projectPath, 'manifest.json');
      let bookName = manifest.project.id;
      usfmJSONObject.book = LoadHelpers.convertToFullBookName(bookName);
      let bookNameUppercase = bookName.toUpperCase();
      let sourceTranslation = manifest.source_translations[0];
      let resourceName = `${sourceTranslation.language_id.toUpperCase()}_${sourceTranslation.resource_id.toUpperCase()}`;
      let lastEdited = fs.statSync(projectPath).atime;
      let targetLanguageCode = `${manifest.target_language.id}_${manifest.target_language.id}_${manifest.target_language.direction}`
      usfmJSONObject.id = `${bookNameUppercase}, ${targetLanguageCode}, ${resourceName}, ${lastEdited}`;
      
      let currentFolderChapters = fs.readdirSync(Path.join(projectPath, bookName));
      for (var currentChapterFile of currentFolderChapters) {
        let currentChapter = Path.parse(currentChapterFile).name;
        let chapterNumber = parseInt(currentChapter);
        if (!chapterNumber) continue;
        let currentChapterObject = fs.readJSONSync(Path.join(projectPath, bookName, currentChapterFile));
        usfmJSONObject[chapterNumber] = currentChapterObject;
      }
      let usfmData = usfm.toUSFM(usfmJSONObject);
      fs.outputFileSync(filePath, usfmData);
      dispatch(AlertModalActions.openAlertDialog(projectName + " has been successfully exported.", false));
    } catch (err) {
      dispatch(AlertModalActions.openAlertDialog(err, false));
    }
  })
}