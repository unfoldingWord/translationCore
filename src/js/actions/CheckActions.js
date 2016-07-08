var Dispatcher = require('../dispatchers/Dispatcher');
var consts = require('./CheckActionConsts');
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

};