import consts from '../actions/ActionTypes';

const INITIAL_STATE = {
  selectedProjectFilename: '',
  sourceProjectPath: '',
  oldSelectedProjectFileName: null,
};

const localImportReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
  case consts.UPDATE_SELECTED_PROJECT_FILENAME:
    return {
      ...state,
      selectedProjectFilename: action.selectedProjectFilename,
    };
  case consts.OLD_SELECTED_PROJECT_FILENAME:
    return {
      ...state,
      oldSelectedProjectFileName: action.oldSelectedProjectFileName,
    };
  case consts.UPDATE_SOURCE_PROJECT_PATH:
    return {
      ...state,
      sourceProjectPath: action.sourceProjectPath,
    };
  case consts.RESET_LOCAL_IMPORT_REDUCER:
    return INITIAL_STATE;
  default:
    return state;
  }
};

export default localImportReducer;
