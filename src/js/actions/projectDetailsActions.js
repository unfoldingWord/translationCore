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
 * @description this sets a property name and a value name in the project detail reducer.
 *  @example detailName = bookName and detailtData = 'Matthew' then
 *  projectDetailReducer will look as follow:
 *  {
 *    ...,
 *    bookname: Matthew
 *  }
 * @param {sting} detailName - projectDetailReducer property name where detailData is saved.
 * @param {multiple} detailData - this varaiable could be anything from a string, array,
 * object, boolean ect.
 * @return {object} action object.
 */
export const setProjectDetail = (detailName, detailData) => {
  return {
    type: consts.SET_PROJECT_DETAIL,
    detailName,
    detailData
  };
};
