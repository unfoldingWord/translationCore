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
        redux: "is amazing"
      };
module.exports = function coreStore(state, action) {
    state = state || initialState
    switch (action.type) {
        case consts.CHANGE_UPLOAD_MODAL_VISIBILITY:
            return Object.assign({}, state, {uploadModalVisibility: action.uploadModalVisibility});
            break;

        case consts.CHANGE_LOGIN_MODAL_VISIBILITY:
            return Object.assign({}, state, {loginModalVisibility: action.loginModalVisibility });
            break;

        case consts.SETTINGS_VIEW:
            return Object.assign({}, state, {settingsView: action.settingsView });
            break;

        case consts.OPEN_VIEW:
            return Object.assign({}, state, {openView: action.openView });
            break;

        case consts.CHANGE_BUTTON_STATUS:
            return Object.assign({}, state, {buttonStatus: action.buttonStatus });
            break;

        case consts.CHANGE_ONLINE_STATUS:
            return Object.assign({}, state, {onlineStatus: action.onlineStatus });
            break;

        case consts.OPEN_CREATED_PROJECT:
            return Object.assign({}, state, {openProjectModalVisibility: action.openProjectModalVisibility });
            break;

        case consts.CREATE_PROJECT:
            return Object.assign({}, state, {createProjectModal: action.createProjectModal });
            break;

        case consts.CHANGE_CREATE_PROJECT_TEXT:
            return Object.assign({}, state, {createProjectText: action.createProjectText });
            break;

        case consts.SEND_FETCH_DATA:
            return Object.assign({}, state, {fetchDataArray: action.fetchDataArray });
            break;

        case consts.START_LOADING:
            debugger;
            var doneLoading = false;
            var progressObject = [];
            return Object.assign({}, state, doneLoading, progressObject );
            break;

        case consts.SEND_PROGRESS_FOR_KEY:
            //var progressKeyObj = this.calculateProgress(action.progressRecieved);
            return Object.assign({}, state, progressKeyObj );
            break;

        case consts.MOD_PROGRESS_VIEW:
            return Object.assign({}, state, {modProgressView: action.modProgressView });
            break;

        case consts.DONE_LOADING:
            debugger;
            var doneLoading = true;
            var modProgressView = true;
            var progressKeyObj = null;
            var loaderModalVisibility = false;
            debugger;
            return function () {
                dispatch(changeCheckType({ currentCheckNamespace: this.currentCheckNamespace }));
                var reports = [];
                let modulesFolder = PACKAGE_COMPILE_LOCATION;
                fs.readdir(modulesFolder, function (err, modules) {
                    for (var module of modules) {
                        try {
                            let aReportView = require(path.join(modulesFolder, module, "ReportView.js"));
                            reports.push(aReportView);
                        } catch (e) {
                        }
                    }
                    CheckStore.putInCommon("reportViews", reports);
                    return Object.assign({}, state, doneLoading, modProgressView, progressKeyObj, loaderModalVisibility );
                });
            }
            break;

        case consts.NEW_PROJECT:
            debugger;
            var doneLoading = false;
            var checkCategoryOptions = null;
            return Object.assign({}, state, doneLoading, checkCategoryOptions, {reportViews: action.reportViews});
            break;

        case consts.ACCOUNT_LOGIN:
            return Object.assign({}, state, {user: action.user});
            break;

        case consts.CHANGE_PROFILE_VISIBILITY:
            return Object.assign({}, state, {profileOption: action.profileOption});
            break;

        case consts.CHANGE_CHECK_MODAL_VISIBILITY:
            return Object.assign({}, state, {checkModalOption: action.checkModalOption});
            break;

        case consts.ALERT_MODAL:
            return Object.assign({}, state, {alert: action.alert});
            break;

        case consts.ALERT_MODAL_RESPONSE:
            return Object.assign({}, state, {alertResponseObj: action.alertResponseObj});
            break;

        case consts.SHOW_TOAST_PARAMS:
            return Object.assign({}, state, {toastOption: action.toastOption, toastParams: action.toastParams});
            break;

        case consts.UPDATE_POPOVER:
            return Object.assign({}, state, {
                    popoverVisibility: action.popoverVisibility,
                    popoverBody: action.popoverBody, 
                    popoverTitle: action.popoverTitle,
                    popoverTop: action.popoverTop,
                    popoverLeft: action.popoverLeft
                });
            break;

        default:
            return state;
    }
}