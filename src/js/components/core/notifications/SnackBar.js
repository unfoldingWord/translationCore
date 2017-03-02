import React, { Component } from 'react'
import Snackbar from 'material-ui/Snackbar'


class ToastComponent extends Component{

  render(){
    let { notificationObject, hideNotification } = this.props;
    let { visibleNotification, message, duration } = notificationObject;
    if(!visibleNotification && !message){
      return (<span></span>);
    }else{
      return(
        <Snackbar
         open={visibleNotification}
         message={message}
         autoHideDuration={duration}
         onRequestClose={hideNotification}
         bodyStyle={{ background: '#000000' }}
         contentStyle={{ color: '#ffffff' }}
       />
      );
    }
  }
}

module.exports = ToastComponent;
