import consts from './CoreActionConsts';

export const setSettings = function(field, value) {
  return ((dispatch, getState) => {
    let settingsObj = getState().settingsReducer.currentSettings;
    settingsObj[field] = value;
    dispatch({
      type: consts.CHANGE_SETTINGS,
      val: settingsObj
    });
  });
};

export const toggleSettings = function(field) {
  return ((dispatch, getState) => {
    let settingsObj = getState().settingsReducer.currentSettings;
    settingsObj[field] = !settingsObj[field];
    dispatch({
      type: consts.CHANGE_SETTINGS,
      val: settingsObj
    });
  });
};
