const CoreStore = require('../.././stores/CoreStore');
const CoreActions = require('../.././actions/CoreActions');
const CheckStore = require('../.././stores/CheckStore');
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
      }
      catch(e){
      }
      data = null;
      this.alertResponseObj = null;
    }
  }
};

module.exports = Alert;
