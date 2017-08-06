import consts from '../actions/ActionTypes';

const initialState = {
  projectSaveLocation: '',
  bookName: '',
  manifest: {},
  params: {},
  currentProjectToolsProgress: {},
  targetLanguageBible: {}
};

const projectDetailsReducer = (state = initialState, action) => {
  switch (action.type) {
    case consts.SET_SAVE_PATH_LOCATION:
      return {
        ...state,
        projectSaveLocation: action.pathLocation
      };
    case consts.SET_PROJECT_DETAIL:
      return {
        ...state,
        [action.key]: action.value
      };
    case consts.STORE_MANIFEST:
      return {
        ...state,
        manifest: action.manifest
      };
    case consts.STORE_PARAMS:
      return {
        ...state,
        params: action.params
      };
    case consts.SET_TARGET_LANGUAGE_BIBLE:
      return {
        ...state,
        targetLanguageBible: action.bible
      };
    case consts.SET_PROJECT_PROGRESS_FOR_TOOL:
      return {
        ...state,
        currentProjectToolsProgress: {
          ...state.currentProjectToolsProgress,
          [action.toolName]: action.progress
        }
      };
    case consts.RESET_PROJECT_DETAIL:
      return initialState;
    default:
      return state;
  }
};

export default projectDetailsReducer;
