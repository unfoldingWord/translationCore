/**
 * @author Logan Lebanoff
 * @description Stores data relating to Check Modules.
 *              It has data like: an array of all the checks, the id of the current
 *              check category, and a list of all the check cateogry options.
 ******************************************************************************/

var EventEmitter = require('events').EventEmitter;
var Dispatcher = require('../dispatchers/Dispatcher');
var CheckConsts = require("../actions/CheckActionConsts.js");
var FileModule = require("../components/core/FileModule.js");
var utils = require("../utils.js");

var CHANGE_EVENT = 'change';

class CheckStore extends EventEmitter {
  constructor() {
    super();
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
    // -1 means no checkCategory is selected
    this.checkCategoryId = -1;
    // TODO: this needs to be filled with actual data when the project is loaded
    this.checkCategoryOptions = [
      {
          name: "Lexical Checks",
          id: 1,
          filePath: window.__base + "/data/projects/eph_mylanguage/check_modules/lexical_check_module/check_data.json"
      },
      {
          name: "Phrase Checks",
          id: 2,
          filePath: window.__base + "/data/projects/eph_mylanguage/check_modules/phrase_check_module/check_data.json"
      }
    ];
    // For ExampleCheckModule
    this.checkIndex = 0;
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

  getCurrentCheckCategory() {
    return this.getCheckCategory(this.checkCategoryId);
  }

  findById(source, id) {
   return source.find(function(item) {
      return item.id == id;
   });
  }

  getCheckCategory(id) {
    return this.findById(this.checkCategoryOptions, id);
  }

  getCheckCategoryOptions() {
    return this.checkCategoryOptions;
  }

  // Fills the checks array with the data in jsonObject and the id
  // from newCheckCategory
  fillAllChecks(jsonObject, id) {
    for(var el in jsonObject) {
      this.checks = jsonObject[el];
      break;
    }
    this.checkCategoryId = id;
  }

  emitChange() {
    this.emit(CHANGE_EVENT);
  }

  addChangeListener(callback) {
    this.on(CHANGE_EVENT, callback);
  }

  removeChangeListener(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  }

  handleActions(action) {
    switch(action.type) {
      case CheckConsts.CHANGE_CHECK_PROPERTY:
        this.setCurrentCheckProperty(action.propertyName, action.propertyValue);
        break;

      case CheckConsts.CHANGE_CHECK_CATEGORY:
        this.fillAllChecks(action.jsonObject, action.id);
        break;

      case CheckConsts.NEXT_CHECK:
        this.checkIndex++;
        break;

      case CheckConsts.GO_TO_CHECK:
        this.checkIndex = action.checkIndex;
        break;

      // do nothing
      default:
        return;
    }
    this.emitChange();
  }

}

const checkStore = new CheckStore;
Dispatcher.register(checkStore.handleActions.bind(checkStore));
module.exports = checkStore;
