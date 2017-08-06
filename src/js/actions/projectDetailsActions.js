import consts from './ActionTypes';
import fs from 'fs-extra';
import path from 'path-extra';
// constants
const INDEX_FOLDER_PATH = path.join('.apps', 'translationCore', 'index');

/**
 * @description sets the project save location in the projectDetailReducer.
 * @param {string} pathLocation - project save location and/or directory.
 * @return {object} action object.
 */
export const setSaveLocation = pathLocation => {
  return {
    type: consts.SET_SAVE_PATH_LOCATION,
    pathLocation
  };
};
/**
 * @description this sets a key name and a value name in the project detail reducer.
 *  @example key = bookName and value = 'Matthew' then
 *  projectDetailReducer will look as follow:
 *  {
 *    ...,
 *    bookname: Matthew
 *  }
 * @param {sting} key - projectDetailReducer key name where value is saved.
 * @param {*} value - this variable could be anything from a string, array,
 * object, boolean ect.
 * @return {object} action object.
 */
export const setProjectDetail = (key, value) => {
  return {
    type: consts.SET_PROJECT_DETAIL,
    key,
    value
  };
};

export const resetProjectDetail = () => {
  return {
    type: consts.RESET_PROJECT_DETAIL
  };
};

/**
 * @description Sends project manifest to the store
 * @param {object} manifest - manifest file of a project.
 * @return {object} action object.
 */
export function setProjectManifest(manifest) {
  return {
    type: consts.STORE_MANIFEST,
    manifest: manifest
  };
}

/**
 * @description Sends project parameters to the store
 * @param {*} params - any params to be saved.
 * @return {object} action object.
 */
export function setProjectParams(params) {
  return {
    type: consts.STORE_PARAMS,
    params: params
  };
}

export function setTargetLanguageBible(bible) {
  return {
    type: consts.SET_TARGET_LANGUAGE_BIBLE,
    bible
  }
}

export function getProjectProgressForTools(toolName) {
  return ((dispatch, getState) => {
    const {
      projectDetailsReducer: {
        projectSaveLocation,
        params
      }
    } = getState();

    const bookId = params.bookAbbr;
    const pathToCheckDataFiles = path.join(projectSaveLocation, INDEX_FOLDER_PATH, toolName, bookId);
    const progress = getToolProgress(pathToCheckDataFiles);

    dispatch({
      type: consts.SET_PROJECT_PROGRESS_FOR_TOOL,
      toolName,
      progress
    });
  });
}

function getToolProgress(pathToCheckDataFiles) {
  let progress = 0;
  if(fs.existsSync(pathToCheckDataFiles)) {
    let groupDataFiles = fs.readdirSync(pathToCheckDataFiles).filter(file => { // filter out .DS_Store
          return file !== '.DS_Store' && path.extname(file) === '.json'
    });
    let allGroupDataObjects = {};
    groupDataFiles.map((groupDataFileName) => {
      const groupData = fs.readJsonSync(path.join(pathToCheckDataFiles, groupDataFileName));
      allGroupDataObjects[groupDataFileName.replace('.json', '')] = groupData;
    });
    progress = calculateProgress(allGroupDataObjects);
  }
  return progress;
}

/**
  * @description generates the progress percentage
  * @param {object} groupsData - all of the data to calculate percentage from
  * @return {double} - percentage number returned
  */
function calculateProgress(groupsData) {
  let percent;
  const groupIds = Object.keys(groupsData);
  let totalChecks = 0, completedChecks = 0;
  // Loop through all checks and tally completed and totals
  groupIds.forEach( groupId => {
    const groupData = groupsData[groupId];
    groupData.forEach( check => {
      totalChecks += 1;
      // checks are considered completed if selections
      completedChecks += (check.selections) ? 1 : 0;
    });
  });
  // calculate percentage by dividing total by completed
  percent = Math.round(completedChecks / totalChecks * 100) / 100;
  return percent;
  }
