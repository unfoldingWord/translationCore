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
      type: consts['ChangeCheckProperty'],
      propertyName: propertyName,
      propertyValue: propertyValue
    });
  }

};