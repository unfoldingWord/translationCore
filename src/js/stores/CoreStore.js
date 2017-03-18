var CHANGE_EVENT = 'change';
var EventEmitter = require('events').EventEmitter;
var Dispatcher = require('../dispatchers/Dispatcher');
var consts = require('../actions/CoreActionConsts');
var CheckStore = require('./CheckStore');
var CHANGE_EVENT = 'change';
var path = require('path');
var fs = require(window.__base + 'node_modules/fs-extra');
const pathex = require('path-extra');
const PARENT = pathex.datadir('translationCore')
const PACKAGE_COMPILE_LOCATION = pathex.join(PARENT, 'packages-compiled')
const PACKAGE_SUBMODULE_LOCATION = pathex.join(window.__base, 'tC_apps');

/**
Keep pretty much all business logic and data in
here. Make methods so components can retrieve
that data.
How to use the store:
Require this file in your component, and call
methods to get whatever data you need. Also include
the following snippet in your component:

componentWillMount() {
CoreStore.addChangeListener(this.{YOUR METHOD HERE});
}

componentWillUnmount() {
CoreStore.removeChangeListener(this.{YOUR METHOD HERE});
}

This will make it so your component will be subscribed
to the store and listen for the store's emits. The store
sends an emit when its data changes, and any subscribed
component will hear it and be able to ask for updated data.
(See ExampleComponent.js)
*/

class CoreStore extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(20);
    this.doneLoading = true;
  }

  getNumberOfFetchDatas() {
    return this.numberOfFetchDatas;
  }

  getModal() {
    return this.modalVisibility;
  }

  getLoginModal(){
    return this.loginModalVisibility;
  }

  getOpenView() {
    return this.getView;
  }

  emitChange() {
    this.emit(CHANGE_EVENT);
  }

  getShowProjectModal() {
    return this.projectModalVisibility;
  }

  getModProg() {
    return this.modProgressView;
  }

  getCreateProjectText() {
    return this.projectText;
  }

  getDataFromProject() {
    return this.FetchDataArray;
  }

  sendProjectData() {
    return this.projectData;
  }

  getOpenModal() {
    return this.openProjectModal;
  }

  getFilePath() {
    return this.filepath;
 }

  getProgress() {
    return this.progress;
  }

  calculateProgress(progressKey) {
    // console.log(progressKey);
    if (!this.progressObject) {
      this.progressObject = [];
    }
    this.progressObject[progressKey.key] = progressKey.progress;
    var currentProgress = 0;
    for (var key in this.progressObject){
      currentProgress += this.progressObject[key];
    }
    var number = this.getNumberOfFetchDatas();
    currentProgress = currentProgress / number;
    this.progress = currentProgress;
  }

  emitChange() {
    this.emit(CHANGE_EVENT);
  }

  getOnlineStatus(){
    return this.onlineStatus;
  }

  getLoggedInUser() {
    return this.userLoggedIn;
  }

  getAlertMessage() {
    return this.alertObj;
  }

  getAlertResponseMessage() {
    this.alertObj['alertObj'] = null;
    return this.alertResponseObj;
  }

  getProfileVisibility(){
    if(this.profileVisibility) {
      return this.profileVisibility;
    }else {
      return false;
    }
  }

  getCheckModal(){
    return this.checkModalVisibility;
  }

  getNotificationToastParams() {
    return this.toastParamsObj;
  }

  getToastVisibility(){
    return this.toastVisibility;
  }

  getCurrentCheckCategory() {
    return this.currentCheckCategory;
  }

  setCurrentCheckCategory(value) {
    this.currentCheckNamespace = value;
  }

  getCurrentCheckNamespace() {
    return this.currentCheckNamespace;
  }

/**
  * @param {function} callback
  */

  addChangeListener(callback) {
    this.on(CHANGE_EVENT, callback);
  }

  removeChangeListener(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  }

  handleActions(action) {
    switch (action.type) {
      case consts.CHANGE_LOGIN_MODAL_VISIBILITY:
        this.loginModalVisibility = action.loginModalOption;
        this.emitChange();
        break;

      case consts.OPEN_VIEW:
        this.getView = action.view;
        this.emitChange();
        break;

      case consts.CHANGE_BUTTON_STATUS:
        this.buttonStatus = action.buttonStatus;
        this.emitChange();
        break;

      case consts.CHANGE_ONLINE_STATUS:
        this.onlineStatus = action.onlineStatus;
        this.emitChange();
      break;

      case consts.OPEN_CREATED_PROJECT:
        this.openProjectModal = action.visible;
        this.emitChange();
      break;

      // case consts.CREATE_PROJECT:
      //   this.projectModalVisibility = action.createProjectModal;
      //   this.emitChange();
      // break;

      case consts.CHANGE_CREATE_PROJECT_TEXT:
        this.projectText = action.modalValue;
        this.emitChange();
      break;

      case consts.SEND_FETCH_DATA:
        this.FetchDataArray = action.array;
        this.emitChange();
      break;

      case consts.SEND_PROGRESS_FOR_KEY:
        var progressKey = action.progressRecieved;
        this.calculateProgress(progressKey);
        this.emitChange();
      break;

      case consts.MOD_PROGRESS_VIEW:
        this.modProgressView = action.view;
        this.emitChange();
      break;

      // case consts.DONE_LOADING:
      //   this.doneLoading = true;
      //   this.modProgressView = true;
      //   this.progressKeyObj = null;
      //   this.loaderModalVisibility = false;
      //   CheckStore.emitEvent('changeCheckType', {currentCheckNamespace: this.currentCheckNamespace});
      //   var reports = [];
      //   let modulesFolder = PACKAGE_SUBMODULE_LOCATION;
      //   fs.readdir(modulesFolder, function(err, modules){
      //   for (var module of modules) {
      //     try {
      //       let aReportView = require(path.join(modulesFolder, module, "ReportView.js"));
      //       reports.push(aReportView);
      //     } catch (e) {
      //     }
      //   }
      //   CheckStore.putInCommon("reportViews", reports);
      //   });
      //   this.emitChange();
      // break;

      case consts.NEW_PROJECT:
        this.doneLoading = false;
        this.checkCategoryOptions = null;
        this.emitChange();
      break;

      case consts.KILL_LOADING:
        this.doneLoading = true;
        this.checkCategoryOptions = null;
        this.emitChange();
      break;

      case consts.ACCOUNT_LOGIN:
        this.userLoggedIn = action.user;
        this.emitChange();
        break;

      case consts.CHANGE_CHECK_MODAL_VISIBILITY:
        this.checkModalVisibility = action.checkModalOption;
        this.emitChange();
        break;

      case consts.ALERT_MODAL:
        this.alertObj = action.alert;
        this.emitChange();
      break;

      case consts.ALERT_MODAL_RESPONSE:
        this.alertResponseObj = action.alertResponse;
        this.emitChange();
      break;

      case consts.SHOW_TOAST_PARAMS:
        this.toastVisibility = action.toastOption;
        this.toastParamsObj = action.toastParams;
        this.emitChange();
      break;

      case consts.UPDATE_POPOVER:
        this.popoverVisibility = action.visibility;
        this.popoverBody = action.body;
        this.popoverTitle = action.title;
        this.popoverTop = action.top;
        this.popoverLeft = action.left;
        this.emitChange();
      break;

      default:
      // do nothing
    }
  }
}

const coreStore = new CoreStore;
Dispatcher.register(coreStore.handleActions.bind(coreStore));
module.exports = coreStore;
