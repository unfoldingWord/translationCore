var consts = require('../actions/CoreActionConsts');
var CheckStore = require('../stores/CheckStore'); //factoring this out
var path = require('path');
var fs = require(window.__base + 'node_modules/fs-extra');
var pathex = require('path-extra');
var PARENT = pathex.datadir('translationCore')
var PACKAGE_COMPILE_LOCATION = pathex.join(PARENT, 'packages-compiled')

const initialState = {
      };
module.exports = function coreStore(state, action) {
    state = state || initialState
    switch (action.type) {
        default:
            return state;
    }
}