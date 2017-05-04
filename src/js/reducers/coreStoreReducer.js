import consts from '../actions/CoreActionConsts';

const initialState = {
  doneLoading: true,
  currentCheckNamespace: null,
  fetchDatas: 0,
  doneModules: 0,
  modules: {},
  moduleData: {},
  toolsArray: []
};

const coreStoreReducer = (state = initialState, action) => {
  switch (action.type) {
    case consts.CHANGE_WRAPPER_VIEW:
      return { ...state, showTool: action.val }
    case consts.DONE_MODULES:
      return {
        ...state,
        doneModules: state.doneModules
      }
    case consts.DONE_LOADING:
      return {
        ...state,
        doneModules: 0,
        doneLoading: true
      }
    case consts.UPDATE_NAMESPACE:
      return {
        ...state,
        currentCheckNamespace: action.currentCheckNamespace
    }
    case consts.SAVE_MODULE_VIEW:
      return {
        ...state,
        modules: {
          ...state.modules,
          [action.identifier]: action.module
        }
      }
    case consts.SAVE_MODULE_DATA:
      return {
        ...state,
        moduleData: {
          ...state.moduleData,
          [action.identifier]: action.data
        }
      }
    case consts.CLEAR_PREVIOUS_DATA:
      return {
        ...state,
        ...initialState
     }
    case consts.STORE_TOOLS_ARRAY:
      return {
        ...state
      };
    // THINK ABOUT WHAT IS BEING LOADED FROM STORE
    default:
      return state;
  }
};

export default coreStoreReducer;
