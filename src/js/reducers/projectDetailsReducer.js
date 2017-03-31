import consts from '../actions/CoreActionConsts';

const initialState = {
  projectSaveLocation: '',
  manifest: null,
  params: null
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
        [action.detailName]: action.detailData
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
    case consts.DRAG_DROP_SENDPATH:
      return {
        ...state,
        projectSaveLocation: action.filePath
      };
    default:
      return state;
  }
};

export default projectDetailsReducer;
