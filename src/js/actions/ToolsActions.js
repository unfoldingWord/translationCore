import consts from './ActionTypes';
import path from 'path-extra';
import fs from 'fs-extra';
// actions
import * as modalActions from './ModalActions.js';
import * as GetDataActions from './GetDataActions.js';
import * as BodyUIActions from './BodyUIActions';
// constant declarations
const PACKAGE_SUBMODULE_LOCATION = path.join(window.__base, 'tC_apps');

export function loadTool(folderName, currentToolName) {
  return ((dispatch, getState) => {
    dispatch(BodyUIActions.toggleHomeView(true));
    dispatch(modalActions.showModalContainer(false));
    dispatch(GetDataActions.loadModuleAndDependencies(folderName, currentToolName));
  });
}

export function getToolsMetadatas() {
  return ((dispatch) => {
    getDefaultTools((moduleFolderPathList) => {
      fillDefaultTools(moduleFolderPathList, (metadatas) => {
        sortMetadatas(metadatas);
        dispatch({
          type: consts.GET_TOOLS_METADATAS,
          val: metadatas
        });
      })
    })
  })
}

const getDefaultTools = (callback) => {
  let defaultTools = [];
  fs.ensureDirSync(PACKAGE_SUBMODULE_LOCATION);
  let moduleBasePath = PACKAGE_SUBMODULE_LOCATION;
  let folders = fs.readdirSync(moduleBasePath);
  folders = folders.filter(folder => { // filter the folder to not include .DS_Store.
    return folder !== '.DS_Store';
  });
  if (folders) {
    for (let folder of folders) {
      try {
        let manifestPath = path.join(moduleBasePath, folder, 'package.json');
        let packageJson = require(manifestPath);
        let installedPackages = fs.readdirSync(moduleBasePath);
        if (packageJson.display === 'app') {
          let dependencies = true;
          for (let app in packageJson.include) {
            if (!installedPackages.includes(app)) {
              dependencies = false;
            }
          }
          if (dependencies) {
            defaultTools.push(manifestPath);
          }
        }
      } catch (e) {
        console.log(e);
      }
    }
  }
  callback(defaultTools);
};

const sortMetadatas = (metadatas) => {
  metadatas.sort((a, b) => {
    return a.title < b.title ? -1 : 1;
  });
}

const fillDefaultTools = (moduleFilePathList, callback) => {
  let tempMetadatas = [];
  // This makes sure we're done with all the files first before we call the callback
  let totalFiles = moduleFilePathList.length;
  let doneFiles = 0;
  function onComplete() {
    doneFiles++;
    if (doneFiles == totalFiles) {
      callback(tempMetadatas);
    }
  }
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
      onComplete();
    });
  }
}
