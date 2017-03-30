import consts from '../actions/CoreActionConsts';

const initialState = {};

const modulesSettingsReducer = (state = initialState, action) => {
  switch (action.type) {
    case consts.UPDATE_MODULE_SETTINGS:
      return {
        ...state,
        [action.moduleNamespace]: {
          ...state.action.moduleNamespace,
          [action.settingsPropertyName]: action.moduleSettingsData
        }
      };
    default:
      return state;
  }
};

export default modulesSettingsReducer;
