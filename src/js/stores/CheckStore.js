var EventEmitter = require('events').EventEmitter;
var Dispatcher = require('../dispatchers/Dispatcher');
var consts = require("../actions/CheckActionConsts.js");
var utils = require("../utils.js");
var Fetcher = require('../components/modules/phrase_check_module/FetchData');

var CHANGE_EVENT = 'change';

class CheckStore extends EventEmitter {
  constructor() {
    super();
    this.groups = [];
    this.temporaryOnCompleteCallback = this.temporaryOnCompleteCallback.bind(this);
    Fetcher('eph', function(a,b){}, this.temporaryOnCompleteCallback);
    // For ExampleCheckModule
    this.groupIndex = 0;
    this.checkIndex = 0;

  }

  temporaryOnCompleteCallback(err, obj){
    if(err){
      console.log(err);
    }else{
      this.groups = obj["Phrase Checks"];
      this.emitChange();
      console.log(this.groups);
    }
  }

  // Public function to return a list of all of the groups, which contain checks.
  // Should usually be used by the navigation menu, not the check module, because
  // the check module only displays a single check
  getAllGroups() {
    return this.groups;
  }


  // Public function to return a list of all of the checks.
  // Should usually be used by the navigation menu, not the check module, because
  // the check module only displays a single check
  getAllChecks() {
    return this.checks;
  }

  // Public function to return a deep clone of the current group
  // Why not just return this.groups[this.groupIndex]? Because that returns a reference to

  // the object, and we don't want any changes made here to be reflected elsewhere,
  // and vice versa
  getCurrentGroup() {
    var group = this.groups[this.groupIndex];
    return utils.cloneObject(group);
  }

  // Public function to return a deep clone of the current check
  // Why not just return this.checks[this.checkIndex]? See getCurrentGroup()
  getCurrentCheck() {
    if(this.groups.length == 0){
      return null;
    }
    var check = this.groups[this.groupIndex].checks[this.checkIndex];
    return utils.cloneObject(check);
  }

  // Public function to return the current check's position in the groups array
  getGroupIndex() {
    return this.groupIndex;
  }

  // Public function to return the current check's position in the checks array
  getCheckIndex() {
    return this.checkIndex;
  }

  setCurrentCheckProperty(propertyName, propertyValue) {
    this.groups[this.groupIndex].checks[this.checkIndex][propertyName] = propertyValue;
  }

  emitChange() {
    this.emit(CHANGE_EVENT);
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
    switch(action.type) {
      case consts.CHANGE_CHECK_PROPERTY:
        this.setCurrentCheckProperty(action.propertyName, action.propertyValue);
        this.emitChange();
        break;

      case consts.NEXT_CHECK:
        this.checkIndex++;
        // If there are no more checks in the group, go to the next group
        if(!this.getCurrentCheck()) {
          this.groupIndex++;
          this.checkIndex = 0;
        }
        this.emitChange();
        break;

      case consts.GO_TO_CHECK:
        this.groupIndex = action.groupIndex;
        this.checkIndex = action.checkIndex;
        this.emitChange();
        break;

      default:
        // do nothing
    }
  }
}

const checkStore = new CheckStore;
Dispatcher.register(checkStore.handleActions.bind(checkStore));
module.exports = checkStore;
window.checkStore = checkStore;
