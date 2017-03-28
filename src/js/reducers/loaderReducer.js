import consts from '../actions/CoreActionConsts';

const initialState = {
  show: false,
  progress: 0,
  progressObject: {},
  fetchDatas: 0
};

module.exports = (state = initialState, action) => {
  switch (action.type) {
    case consts.TOGGLE_LOADER_MODAL:
      return { ...state, show: action.show || !state.show }
      break;
    case consts.UPDATE_PROGRESS:
      return {
        ...state,
        progress: action.progress,
        reloadContent: action.reloadContent,
        progressObject: action.progressObject
      }
      break;
    case consts.FETCH_DATA_NUMBER:
      return {
        ...state,
        fetchDatas: action.fetchDatas
      }
      break;
      case consts.DONE_LOADING: 
      return {
        ...state,
        progress:0,
        progressObject:{},
        fetchDatas:0,
        show:false
      }
      break;
    default:
      return state;
  }
}
