/**
 * @description this file holds all methods that handle preloading data into the
 *  store add your methods as needed and then import them into localstorage.js to
 *  be used with the loadState method.
 */
import fs from 'fs-extra';
import path from 'path-extra';
//  consts declaration
const PARENT = path.datadir('translationCore');
const SETTINGS_DIRECTORY = path.join(PARENT, 'settings.json');
const MODULES_SETTINGS_DIRECTORY = path.join(PARENT, 'modulesSettings.json');

export const loadSettings = () => {
  // defining as undefined so that we dont forget that we must
  // return undefined, never null
  let settings = undefined;
  try {
    if (fs.existsSync(SETTINGS_DIRECTORY)) {
      settings = fs.readJsonSync(SETTINGS_DIRECTORY);
    } else {
      console.log("No settings file found therefore it will be created when the settings reducer is fully loaded");
    }
  } catch (err) {
    console.warn(err);
  }
  return settings;
};

/**
 * @description loads the modules settings from file system.
 * @const MODULES_SETTINGS_DIRECTORY - directory where module settings is located.
 * @return {object} action object.
 */
export function loadModulesSettings() {
  try {
    if (fs.existsSync(MODULES_SETTINGS_DIRECTORY)) {
      let modulesSettings = fs.readJsonSync(MODULES_SETTINGS_DIRECTORY);
      return modulesSettings;
    } else {
      // no module settings file found and/or directory not found.
      return {};
    }
  } catch (err) {
    console.warn(err);
    return {};
  }
}

export function loadGroupsData(tool, dataFolder, params) {
  return new Promise((resolve, reject) => {
    let groupDataFolderPath = path.join(dataFolder, 'index', tool, params.bookAbbr);
    fs.readdir(groupDataFolderPath, (err, groupDataFolderObjs) => {
      if (!err) {
        var allGroupsObjects = {};
        var total = groupDataFolderObjs.length;
        var i = 0;
        for (var groupId in groupDataFolderObjs) {
          if (path.extname(groupDataFolderObjs[groupId]) != '.json') {
            total--;
            continue;
          }
          let groupName = groupDataFolderObjs[groupId].split('.')[0];
          const saveGroup = (groupName, groupDataFolderPath) => {
            const groupPath = path.join(groupDataFolderPath, groupName + '.json');
            fs.readJson(groupPath, (err, groupObj) => {
              if (!err) {
                allGroupsObjects[groupName] = groupObj;
                i++;
                if (i >= total) {
                  resolve(allGroupsObjects, dataFolder);
                }
              } else {
                total--;
              }
            });
          }
          saveGroup(groupName, groupDataFolderPath);
        }
      } else reject(err);
    });
  });
}

export function loadCheckDataData(dataFolder, params, type) {
  return new Promise((resolve, reject) => {
    try {
      let chapterFolder = path.join(dataFolder, 'checkData', type, params.bookAbbr);
      let chapters = fs.readdirSync(chapterFolder);
      let checkDataArray = [];
      for (var chapter of chapters) {
        if (!parseInt(chapter)) continue;
        let verses = fs.readdirSync(path.join(chapterFolder, chapter));
        for (var verse of verses) {
          if (!parseInt(verse)) continue;
          let chapterObjects = path.join(chapterFolder, chapter, verse);
          let verseObjects = fs.readdirSync(chapterObjects);
          for (var index in verseObjects) {
            const currentDataObjectPath = path.join(chapterObjects, verseObjects[index])
            let dataObject = fs.readJsonSync(currentDataObjectPath);
            checkDataArray.push(dataObject);
          }
        }
      }
      resolve(checkDataArray, dataFolder);
    } catch (e) {
    }
  });
}
