import consts from './CoreActionConsts';
import path from 'path-extra';
import fs from 'fs-extra';
// actions
import * as modalActions from './ModalActions.js';
import * as GetDataActions from './GetDataActions.js';
import * as BodyUIActions from './BodyUIActions';
// constant declarations
const PACKAGE_SUBMODULE_LOCATION = path.join(window.__base, 'tC_apps');
// const api = window.ModuleApi;

export function loadTool(folderName, toolName) {
  return ((dispatch, getState) => {
    dispatch(BodyUIActions.toggleHomeView(true));
    dispatch(modalActions.showModalContainer(false));
    dispatch(GetDataActions.loadModuleAndDependencies(folderName, toolName));
  });
}

export function getToolsMetadatas() {
  return ((dispatch) => {
    getDefaultModules((moduleFolderPathList) => {
      fillDefaultModules(moduleFolderPathList, (metadatas) => {
        sortMetadatas(metadatas);
        // api.putToolMetaDatasInStore(metadatas);
        dispatch({
          type: consts.GET_TOOLS_METADATAS,
          val: metadatas
        });
      })
    })
  })
}

const getDefaultModules = (callback) => {
  var defaultModules = [];
  fs.ensureDirSync(PACKAGE_SUBMODULE_LOCATION);
  var moduleBasePath = PACKAGE_SUBMODULE_LOCATION;
  fs.readdir(moduleBasePath, (error, folders) => {
    if (error) {
      console.error(error);
    } else {
      for (var folder of folders) {
        try {
          var manifestPath = path.join(moduleBasePath, folder, 'package.json');
          var packageJson = require(manifestPath);
          var installedPackages = fs.readdirSync(moduleBasePath);
          if (packageJson.display === 'app') {
            var dependencies = true;
            for (var app in packageJson.include) {
              if (!installedPackages.includes(app)) {
                dependencies = false;
              }
            }
            if (dependencies) {
              defaultModules.push(manifestPath);
            }
          }
        } catch (e) {
        }
      }
    }
    callback(defaultModules);
  });
};

const sortMetadatas = (metadatas) => {
  metadatas.sort((a, b) => {
    return a.title < b.title ? -1 : 1;
  });
}

const fillDefaultModules = (moduleFilePathList, callback) => {
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
