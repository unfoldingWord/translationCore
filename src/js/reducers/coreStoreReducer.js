var consts = require('../actions/CoreActionConsts');
var CheckStore = require('../stores/CheckStore'); //factoring this out
var path = require('path');
var fs = require(window.__base + 'node_modules/fs-extra');
var pathex = require('path-extra');
var PARENT = pathex.datadir('translationCore')
var PACKAGE_COMPILE_LOCATION = pathex.join(PARENT, 'packages-compiled')
const merge = require('lodash.merge');
const PACKAGE_SUBMODULE_LOCATION = pathex.join(window.__base, 'tC_apps');

const initialState = {
    mainViewVisible:false,
    type: 'recent'
};
module.exports = function coreStore(state, action) {
    state = state || initialState
    switch (action.type) {
        case consts.SHOW_APPS:
            return merge({}, state, {
                mainViewVisible:action.val
            });
            break;
        case consts.CHANGE_WRAPPER_VIEW:
            return merge({}, state, {
                type: action.val
            });
            break;
        default:
            return state;
    }
}
