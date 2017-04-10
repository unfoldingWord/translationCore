import consts from './CoreActionConsts';

/**
 * @description initializes settings. In other words ,creates a
 * settings property and assign a value to it.
 * @param {string} field - settings property name.
 * @param {*} value - any data type to assign to the property as a value.
 * @return {object} action object.
 */
export function setSettings(field, value) {
  return ((dispatch, getState) => {
    let settingsObj = getState().settingsReducer.currentSettings;
    settingsObj[field] = value;
    dispatch({
      type: consts.CHANGE_SETTINGS,
      val: settingsObj
    });
  });
}
/**
 * @description toggles settings any kind of settings to eeither false or tru.
 * @param {string} field - settings property name.
 * @return {object} action object.
 */
export function toggleSettings(field) {
  return ((dispatch, getState) => {
    let settingsObj = getState().settingsReducer.currentSettings;
    settingsObj[field] = !settingsObj[field];
    dispatch({
      type: consts.CHANGE_SETTINGS,
      val: settingsObj
    });
  });
}
