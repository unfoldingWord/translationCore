import consts from '../actions/CoreActionConsts'

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
        projectSaveLocation: action.pathLocation,
      }
    case consts.STORE_MANIFEST:
      return {
        ...state,
        manifest: action.manifest
      }
      break;
    case consts.STORE_PARAMS:
      return {
        ...state,
        params: action.params
      }
      break;
    case consts.DRAG_DROP_SENDPATH:
      return { ...state, projectSaveLocation: action.filePath }
      break;
    default:
      return state;
  }
}

export default projectDetailsReducer
