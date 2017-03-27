const consts = require('../actions/CoreActionConsts');

const initialState = {
    mainViewVisible: true,
    type: 'recent',
    doneLoading: 'true',
    currentCheckNamespace: null,
    fetchDatas: 0,
    doneModules: 0,
    modules: {},
    moduleData: {},
    toolsArray:[]
};

module.exports = function coreStore(state, action) {
    state = state || initialState
    switch (action.type) {
        case consts.SHOW_APPS:
            return { ...state, mainViewVisible: action.val }
            break;
        case consts.CHANGE_WRAPPER_VIEW:
            return { ...state, type: action.val }
            break;
        case consts.DONE_MODULES:
            return {
                ...state,
                doneModules: state.doneModules
            }
            break;
        case consts.DONE_LOADING:
            return {
                ...state,
                doneModules: 0
            }
            break;
        case consts.UPDATE_NAMESPACE:
            return {
                ...state,
                currentCheckNamespace: action.currentCheckNamespace
            }
            break;
        case consts.SAVE_MODULE_VIEW:
            return {
                ...state,
                modules: {
                    ...state.modules,
                    [action.identifier]: action.module
                }
            }
            break;
        case consts.SAVE_MODULE_DATA:
            return {
                ...state,
                moduleData: {
                    ...state.moduleData,
                    [action.identifier]: action.data
                }
            }
            break;
        case consts.CLEAR_PREVIOUS_DATA:
            return {
                ...state,
                ...initialState
            }
            break;
        case consts.STORE_TOOLS_ARRAY:
            return {
                ...state,

            }
            break;
        //THINK ABOUT WHAT IS BEING LOADED FROM STORE
        default:
            return state;
    }
}
