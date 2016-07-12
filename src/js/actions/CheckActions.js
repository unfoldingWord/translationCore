var Dispatcher = require('../dispatchers/Dispatcher');
var consts = require('./CheckActionConsts');
var FileModule = require('../components/core/FileModule');
/*
Creates actions related to checks
*/
module.exports = {
  /**
   * Sends an action which will update the current check in CheckStore
   * @param {String} propertyName
   * @param {Object} propertyValue
   */
  changeCheckProperty: function(propertyName, propertyValue) {
    Dispatcher.handleAction({
      type: consts.CHANGE_CHECK_PROPERTY,
      propertyName: propertyName,
      propertyValue: propertyValue
    });
  },

  /**
   * Sends an action which will move the to the next check in CheckStore
   */
  nextCheck: function() {
    Dispatcher.handleAction({
      type: consts.NEXT_CHECK
    });
  },

  /**
   * Sends an action which will move the to the check at the specified index
   * @param {Integer} checkIndex
   */
  goToCheck: function(checkIndex) {
    Dispatcher.handleAction({
      type: consts.GO_TO_CHECK,
      checkIndex: checkIndex
    });
  },

  // Async reads the Json file at the given path, then dispatches an action with
  // the resulting object
  changeCheckCategory: function(newCheckCategory) {
    var this_ = this;
    FileModule.readJsonFile(newCheckCategory.filePath, function(jsonObject) {
      this_.changeCheckCategory_(jsonObject, newCheckCategory.id);
    });
  },

  changeCheckCategory_: function(jsonObject, id) {
    Dispatcher.handleAction({
      type: consts.CHANGE_CHECK_CATEGORY,
      jsonObject: jsonObject,
      id: id
    });
  }

};