var EventEmitter = require('events').EventEmitter;
var Dispatcher = require('../dispatchers/Dispatcher');
var consts = require("../actions/CheckActionConsts.js");
var utils = require("../utils.js");

var CHANGE_EVENT = 'change';

class CheckStore extends EventEmitter {
  constructor() {
    super();
    // For ExampleCheckModule
    this.checkIndex = 0;
    this.checks = [
      {
        book: "Ephesians",
        chapter: 1,
        verse: 11,
        phrase: "God the Father",
        checkStatus: "RETAINED",
        comments: "",
        flagged: false
      },
      {
        book: "Ephesians",
        chapter: 2,
        verse: 12,
        phrase: "Jesus Christ",
        checkStatus: "NOT_CHECKED",
        comments: "",
        flagged: false
      },
      {
        book: "Ephesians",
        chapter: 3,
        verse: 13,
        phrase: "Holy Spirit",
        checkStatus: "NOT_CHECKED",
        comments: "",
        flagged: false
      }
    ];
  }

  // Public function to return a list of all of the checks.
  // Should usually be used by the navigation menu, not the check module, because
  // the check module only displays a single check
  getAllChecks() {
    return this.checks;
  }

  // Public function to return a deep clone of the current check
  // Why not just return this.checks[this.checkIndex]? Because that returns a reference to
  // the object, and we don't want any changes made here to be reflected elsewhere,
  // and vice versa
  getCurrentCheck() {
    var check = this.checks[this.checkIndex];
    return utils.cloneObject(check);
  }

  // Public function to return the current check's position in the checks array
  getCheckIndex() {
    return this.checkIndex;
  }

  setCurrentCheckProperty(propertyName, propertyValue) {
    this.checks[this.checkIndex][propertyName] = propertyValue;
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
        this.emitChange();
        break;

      case consts.GO_TO_CHECK:
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
