import consts from '../actions/ActionTypes';

const initialState = {
  projectSaveLocation: '',
  manifest: {},
  currentProjectToolsProgress: {}
};

const projectDetailsReducer = (state = initialState, action) => {
  switch (action.type) {
    case consts.SET_SAVE_PATH_LOCATION:
      return {
        ...state,
        projectSaveLocation: action.pathLocation
      };
    case consts.STORE_MANIFEST:
      return {
        ...state,
        manifest: action.manifest
      };
    case consts.SET_PROJECT_PROGRESS_FOR_TOOL:
      return {
        ...state,
        currentProjectToolsProgress: {
          ...state.currentProjectToolsProgress,
          [action.toolName]: action.progress
        }
      };
    case consts.ADD_MANIFEST_PROPERTY:
      return {
        ...state,
        manifest: {
          ...state.manifest,
          [action.propertyName]: action.value
        }
      }
    case consts.RESET_PROJECT_DETAIL:
      return initialState;
    default:
      return state;
  }
};

export default projectDetailsReducer;
