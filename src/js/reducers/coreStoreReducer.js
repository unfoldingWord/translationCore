var consts = require('../actions/CoreActionConsts');
var CheckStore = require('../stores/CheckStore'); //factoring this out
var path = require('path');
var fs = require(window.__base + 'node_modules/fs-extra');
var pathex = require('path-extra');
var PARENT = pathex.datadir('translationCore')
var PACKAGE_COMPILE_LOCATION = pathex.join(PARENT, 'packages-compiled')

//   calculateProgress(progressKey) {
//     this.progressObject[progressKey.key] = progressKey.progress;
//     var currentProgress = 0;
//     for (var key in this.progressObject){
//       currentProgress += this.progressObject[key];
//     }
//     var number = this.getNumberOfFetchDatas();
//     currentProgress = currentProgress / number;
//     this.progress = currentProgress;
//   }
const initialState = {
      };
module.exports = function coreStore(state, action) {
    state = state || initialState
    switch (action.type) {
        default:
            return state;
    }
}