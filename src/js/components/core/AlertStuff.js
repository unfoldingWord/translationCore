const CoreStore = require('../.././stores/CoreStore');
const CoreActions = require('../.././actions/CoreActions');
const CheckStore = require('../.././stores/CheckStore');
var alertCallBack = () => {};
var AlertStuff = {
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
      }
      catch(e){

      }
      callback(data);
    }
  }
};

module.exports = AlertStuff;
