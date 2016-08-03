/*
Below is an exampple explanation how to use the Toast Notification Api:

api.Toast.info(title, msg, time);
                        (time in seconds)
                        
api.Toast.info("title", "Update succesful", 3);
api.Toast.error("error title", "error body", 3);
api.Toast.success("error title", "error body", 3);
*/

const React = require('react');
const CoreActions = require('../actions/CoreActions.js');
const style = require('./style');

class ToastNotificationApi {

  success(title, msg, time){
    this.addNotification(title, msg, time, 'success');
  }

  error(title, msg, time){
    this.addNotification(title, msg, time, 'error');
  }

  info(title, msg, time){
    this.addNotification(title, msg, time, 'info');
  }

  addNotification(title, msg, time, theme){
    CoreActions.sendNotificationToast(true, {title: title, msg: msg, time: time, theme: theme});
  }


}

const ToastApi = new ToastNotificationApi();
module.exports = ToastApi;
