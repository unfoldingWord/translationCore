
/**
 * @author: RoyalSix
 * @description: This is the file associated with the alert response
 * to handle transferring of data through a callback
 ******************************************************************************/
const CoreStore = require('../.././stores/CoreStore');
const CoreActions = require('../.././actions/CoreActions');
const CheckStore = require('../.././stores/CheckStore');
const api = window.ModuleApi;
var alertCallBack = () => {};
var Alert = {
  startListener(callback) {
    if (callback) {
      alertCallBack = callback;
    }
    CoreStore.addChangeListener(this.getAlert);
  },
  getAlert(){
    var data = CoreStore.getAlertResponseMessage();
    if(data) {
      try {
        var callback = this.alertObj['alertCallback'];
        callback(data);
        this.alertObj['alertCallback'] = null;
        api.clearAlertCallback();
      }
      catch(e){
      }
      data = null;
      this.alertResponseObj = null;
    }
  }
};

module.exports = Alert;
