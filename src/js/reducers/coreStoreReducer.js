const consts = require('../actions/CoreActionConsts');

const initialState = {
    mainViewVisible: true,
    type: 'recent',
    doneLoading: 'false',
    currentCheckNamespace: null,
    common: null,
    fetchDatas: 0,
    reportViews: [],
    doneModules: 0
};

module.exports = function coreStore(state, action) {
    state = state || initialState
    switch (action.type) {
        case consts.SHOW_APPS:
            return { ...state, mainViewVisible: action.val }
        case consts.CHANGE_WRAPPER_VIEW:
            return { ...state, type: action.val }
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
        default:
            return state;
    }
}
