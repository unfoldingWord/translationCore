import consts from '../actions/CoreActionConsts'

const initialState = {
    projectSaveLocation: ''
};

const projectDetailsReducer = (state = initialState, action) => {
    switch (action.type) {
      case consts.SET_SAVE_PATH_LOCATION:
        return {
          ...state,
          projectSaveLocation: action.pathLocation,
        }
      default:
        return state;
    }
}

export default projectManifestReducer
