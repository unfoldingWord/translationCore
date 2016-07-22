var CHANGE_EVENT = 'change';
var EventEmitter = require('events').EventEmitter;
var Dispatcher = require('../dispatchers/Dispatcher');

var consts = require('../actions/CoreActionConsts');
var CHANGE_EVENT = 'change';

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
  }

  updateNumberOfFetchDatas(number) {
    //console.log('Number: ' + number);
    this.numberOfFetchDatas = number;
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

  getSettingsView() {
    return this.settingsVisibility;
  }

  emitChange() {
    this.emit(CHANGE_EVENT);
  }

  getShowProjectModal() {
    return this.projectModalVisibility;
  }

  getCreateProjectText() {
    return this.projectText;
  }

  getDataFromProject() {
    return this.FetchDataArray;
  }

  getProgress() {
  return this.progressKeyObj;
  }

  emitChange() {
    this.emit(CHANGE_EVENT);
  }

  getButtonStatus(){
    return this.buttonStatus;
  }

  getLogoutButton(){
    return this.logoutButtonVisibility;
  }

  getLoggedInUser() {
    return this.userLoggedIn;
  }

  getProfileVisibility(){
    if(this.profileVisibility) {
    return this.profileVisibility;
  } else {
    return false;
  }
  }

  // Returns an array of objects of the Check Modules (the ones with a ReportView.js)
  // Mostly just for SwitchCheckModuleDropdown
  getCheckCategoryOptions(){
    if(!this.checkCategoryOptions) {
      return null;
    }
    return this.checkCategoryOptions;
  }

  // Returns the Check Module (object) for the given namespace (string)
  findCheckCategoryOptionByNamespace(namespace) {
    for(let category of this.getCheckCategoryOptions()) {
      if(category.name == namespace) {
        return category;
      }
    }
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
      case consts.CHANGE_UPLOAD_MODAL_VISIBILITY:
        this.modalVisibility = action.modalOption;
        this.emitChange();
        break;

      case consts.CHANGE_LOGIN_MODAL_VISIBILITY:
        this.loginModalVisibility = action.loginModalOption;
        this.emitChange();
        break;

      case consts.SETTINGS_VIEW:
        this.settingsVisibility = action.settingsView;
        this.emitChange();
        break;

      case consts.CHANGE_BUTTTON_STATUS:
        this.buttonStatus = action.buttonStatus;
        this.emitChange();
      break;

      case consts.CREATE_PROJECT:
        this.projectModalVisibility = action.createProjectModal;
        this.emitChange();
      break;

      case consts.CHANGE_CREATE_PROJECT_TEXT:
        this.projectText = action.modalValue;
        this.emitChange();
      break;

      case consts.SEND_FETCH_DATA:
        this.FetchDataArray = action.array;
        this.emitChange();
      break;

      case consts.SEND_PROGRESS_FOR_KEY:
        this.progressKeyObj = action.progressRecieved;
        this.emitChange();
      break;

      case consts.DONE_LOADING:
        this.doneLoading = true;
        this.checkCategoryOptions = action.reportViews;
        this.emitChange();
      break;

      case consts.CHANGE_LOGOUT_VISIBILITY:
        this.logoutButtonVisibility = action.logoutOption;
        this.emitChange();
        break;

      case consts.ACCOUNT_LOGIN:
        this.userLoggedIn = action.user;
        this.emitChange();
        break;

      case consts.CHANGE_PROFILE_VISIBILITY:
        this.profileVisibility = action.profileOption;
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
