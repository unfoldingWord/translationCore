import consts from './ActionTypes';
import path from 'path-extra';
import fs from 'fs-extra';
import * as LoadHelpers from '../helpers/LoadHelpers';
import {saveToolViews} from './ToolSelectionActions';
// constant declarations
const PACKAGE_SUBMODULE_LOCATION = path.join(__dirname, '../../../tC_apps');

export function getToolsMetadatas() {
  return ((dispatch) => {
    const moduleFolderPathList = getDefaultTools();
    const metadatas = fillDefaultTools(moduleFolderPathList);
    sortMetadatas(metadatas);
    dispatch({
      type: consts.SET_TOOLS_METADATA,
      val: metadatas
    });
    moduleFolderPathList.forEach((moduleFolderName) => {
      dispatch(saveToolViewsEarly(moduleFolderName.split('package.json')[0]));
    });
  });
}

export function saveToolViewsEarly(moduleFolderName) {
  return dispatch => {
    const modulePath = path.join(moduleFolderName, 'package.json');
    const dataObject = fs.readJsonSync(modulePath);
    const checkArray = LoadHelpers.createCheckArray(dataObject, moduleFolderName);
    dispatch(saveToolViews(checkArray, dataObject));
  };
}

export const getDefaultTools = () => {
  let defaultTools = [];
  fs.ensureDirSync(PACKAGE_SUBMODULE_LOCATION);
  let moduleBasePath = PACKAGE_SUBMODULE_LOCATION;
  let folders = fs.readdirSync(moduleBasePath);
  folders = folders.filter(folder => { // filter the folder to not include .DS_Store.
    return folder !== '.DS_Store';
  });
  if (folders) {
    for (let folder of folders) {
      let manifestPath = path.join(moduleBasePath, folder, 'package.json');
      if(fs.pathExists(manifestPath)) {
        defaultTools.push(manifestPath);
      }
    }
  }
  return defaultTools;
};

export const sortMetadatas = (metadatas) => {
  metadatas.sort((a, b) => {
    return a.title < b.title ? -1 : 1;
  });
};

export const fillDefaultTools = (moduleFilePathList) => {
  let tempMetadatas = [];
  // This makes sure we're done with all the files first before we call the callback
  for (let filePath of moduleFilePathList) {
    fs.readJson(filePath, (error, metadata) => {
      if (error) {
        console.error(error);
      }
      else {
        metadata.folderName = path.dirname(filePath);
        metadata.imagePath = path.resolve(filePath, '../icon.png');
        metadata.badgeImagePath = path.resolve(filePath, '../badge.png');
        tempMetadatas.push(metadata);
      }
    });
  }
  return tempMetadatas;
};
