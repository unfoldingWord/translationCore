import path from 'path-extra';
import fs from 'fs-extra';
import * as LoadHelpers from '../helpers/LoadHelpers';
// constant declarations
const PACKAGE_SUBMODULE_LOCATION = path.join('./tC_apps');

/**
 * @deprecated
 * @returns {{apis, currentToolViews, toolsMetadata: Array}}
 */
export function getToolViewsAndAPIInitialState() {
  let moduleFolderPathList = getDefaultTools();
  const toolsMetadata = fillDefaultTools(moduleFolderPathList);
  sortMetadatas(toolsMetadata);

  const currentToolViews = {};
  const apis = {};

  moduleFolderPathList.forEach((fullPathName) => {
    const moduleFolderName = fullPathName.split('package.json')[0];
    const modulePath = path.join(moduleFolderName, 'package.json');
    const dataObject = fs.readJsonSync(modulePath);
    const checkArray = LoadHelpers.createCheckArray(dataObject, moduleFolderName);

    for (let module of checkArray) {
      try {
        let tool = require(path.join(module.location, dataObject.main)).default;

        // TRICKY: compatibility for older tools
        if ('container' in tool.container && 'name' in tool.container) {
          tool = tool.container;
        }
        // end compatibility fix
        currentToolViews[module.name] = tool.container;

        if (tool.api) {
          apis[module.name] = tool.api;
        }
      } catch (e) {
        console.error(`Failed to load ${module.name} tool`, e);
      }
    }
  });
  return {
    apis, currentToolViews, toolsMetadata,
  };
}

/**
 * @deprecated
 * @returns {Array}
 */
const getDefaultTools = () => {
  let defaultTools = [];
  fs.ensureDirSync(PACKAGE_SUBMODULE_LOCATION);
  let moduleBasePath = PACKAGE_SUBMODULE_LOCATION;
  let folders = fs.readdirSync(moduleBasePath);

  folders = folders.filter(folder => // filter the folder to not include .DS_Store.
    folder !== '.DS_Store',
  );

  if (folders) {
    for (let folder of folders) {
      let manifestPath = path.join(moduleBasePath, folder, 'package.json');

      if (fs.pathExists(manifestPath)) {
        defaultTools.push(manifestPath);
      }
    }
  }
  return defaultTools;
};

/**
 * @deprecated
 * @param metadatas
 */
const sortMetadatas = (metadatas) => {
  metadatas.sort((a, b) => a.title < b.title ? -1 : 1);
};

/**
 * @deprecated
 * @param moduleFilePathList
 * @returns {Array}
 */
const fillDefaultTools = (moduleFilePathList) => {
  let tempMetadatas = [];

  // This makes sure we're done with all the files first before we call the callback
  for (let filePath of moduleFilePathList) {
    fs.readJson(filePath, (error, metadata) => {
      if (error) {
        console.error(error);
      } else {
        metadata.folderName = path.dirname(filePath);
        metadata.imagePath = path.resolve(filePath, '../icon.png');
        metadata.badgeImagePath = path.resolve(filePath, '../badge.png');
        tempMetadatas.push(metadata);
      }
    });
  }
  return tempMetadatas;
};
