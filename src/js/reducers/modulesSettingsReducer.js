import consts from '../actions/CoreActionConsts';

const initialState = {};

const modulesSettingsReducer = (state = initialState, action) => {
  switch (action.type) {
    case consts.UPDATE_MODULE_SETTINGS:
      return {
        [state.action.moduleName]: action.moduleSettingsData
      };
    default:
      break;
  }
};

export default modulesSettingsReducer;
