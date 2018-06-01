import path from 'path-extra';
import fs from 'fs-extra';
// constant declarations
const PACKAGE_SUBMODULE_LOCATION = path.join(__dirname, '../../../tC_apps');
const TOOLS_TO_SHOW = ['wordAlignment', 'translationWords'];

export const getToolsMetadatas = () => {
  return fillDefaultTools(getDefaultTools());
};

const getDefaultTools = () => {
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
        if (packageJson.display === 'app' && TOOLS_TO_SHOW.includes(packageJson.name)) {
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
  return defaultTools;
};

const fillDefaultTools = (moduleFilePathList) => {
  let tempMetadatas = [];

  for (let filePath of moduleFilePathList) {
    try {
      let metadata = fs.readJsonSync(filePath);
      metadata.folderName = path.dirname(filePath);
      metadata.imagePath = path.resolve(filePath, '../icon.png');
      metadata.badgeImagePath = path.resolve(filePath, '../badge.png');
      tempMetadatas.push(metadata);
    }
    catch (error) {
      console.error(error);
    }
  }
  return sortMetadatas(tempMetadatas);
};

const sortMetadatas = (metadatas) => {
  metadatas.sort((a, b) => {
    return a.title < b.title ? -1 : 1;
  });
  return metadatas;
};
