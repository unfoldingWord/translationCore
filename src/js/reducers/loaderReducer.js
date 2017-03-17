const consts = require('../actions/CoreActionConsts');

const initialState = {
  modules: {},
  show: false,
  progress: 0,
  progressObject: {},
  fetchDatas: 0
};

module.exports = (state = initialState, action) => {
  switch (action.type) {
    case consts.TOGGLE_LOADER_MODAL:
      return { ...state, show: action.show || !state.show }
    case consts.SAVE_MODULE:
      state.modules[action.identifier] = action.module;
      return {
        ...state,
        modules: {
          ...state.modules,
        }
      }
    case consts.UPDATE_PROGRESS:
      return {
        ...state,
        progress: action.progress,
        reloadContent: action.reloadContent,
        progressObject: action.progressObject
      }
    case consts.FETCH_DATA_NUMBER:
      return {
        ...state,
        fetchDatas: action.fetchDatas
      }
      case consts.DONE_LOADING: 
      return {
        ...state,
        progress:0,
        progressObject:{},
        fetchDatas:0,
        show:false
      }
    default:
      return state;
  }
}
