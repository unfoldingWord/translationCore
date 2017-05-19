import consts from './CoreActionConsts';

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
