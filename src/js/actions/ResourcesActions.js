import consts from './CoreActionConsts';
import fs from 'fs-extra';
import path from 'path-extra';
// actions
import * as coreActions from './CoreActionsRedux';
// constant declaraton
const RESOURCES_DATA_DIR = path.join('.apps', 'translationCore', 'resources');

export const addNewBible = (bibleName, bibleData) => {
  return {
    type: consts.ADD_NEW_BIBLE_TO_RESOURCES,
    bibleName,
    bibleData
  };
};

export const addNewResource = (resourceName, resourceData, namespace) => {
  return ((dispatch, getState) => {
    const currentCheckIndex = getState().checkStoreReducer.currentCheckIndex || 0;
    const currentGroupIndex = getState().checkStoreReducer.currentGroupIndex || 0;
    if (resourceName == 'groups') {
      dispatch(coreActions.setUpGroupObjectsFromIndex(resourceData, currentCheckIndex, currentGroupIndex));
    }
    dispatch({
      type: consts.ADD_NEW_RESOURCE,
      resourceName,
      resourceData,
      namespace
    });
  });
};

/**
 * @description loads bibles from the filesystem and saves them in the resources reducer.
 */
export function loadBiblesFromFS() {
  return ((dispatch, getState) => {
    const projectSaveLocation = getState().projectDetailsReducer.projectSaveLocation;
    const biblesDirectory = path.join(projectSaveLocation, RESOURCES_DATA_DIR, 'bibles');

    if (fs.existsSync(biblesDirectory)) {
      let biblesObjects = fs.readdirSync(biblesDirectory);

      biblesObjects = biblesObjects.filter(file => { // filter the filenames to only use .json
        return path.extname(file) === '.json';
      });

      for (let bibleName in biblesObjects) {
        if (biblesObjects.hasOwnProperty(bibleName)) {
          let currentBibleName = biblesObjects[bibleName].replace('.json', '');
          let bibleData = fs.readJsonSync(path.join(biblesDirectory, biblesObjects[bibleName]));
          if (bibleData) {
            dispatch(addNewBible(currentBibleName, bibleData));
          } else {
            console.warn("Couldn't load " + currentBibleName + "bible");
          }
        }
      }
    } else {
      console.warn(biblesDirectory + " directory: doesnt exist");
    }
  });
}
