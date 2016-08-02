const React = require('react');
const CoreActions = require('../actions/CoreActions.js');
const CoreStore = require('../stores/CoreStore.js');
const style = require('./style');


class ToastComponent extends React.Component{
  constructor(){
    super();
    this.state = {
      visibleToast: false,
    }
    this.updateToastVisibility = this.updateToastVisibility.bind(this);
    this.updateToastParams = this.updateToastParams.bind(this);
  }

  componentWillMount() {
    CoreStore.addChangeListener(this.updateToastVisibility);
    CoreStore.addChangeListener(this.updateToastParams);
  }

  componentWillUnmount() {
    CoreStore.removeChangeListener(this.updateToastVisibility);
    CoreStore.removeChangeListener(this.updateToastParams);
  }

  updateToastVisibility(){
    this.setState({visibleToast: CoreStore.getToastVisibility()});
  }

  updateToastParams(){
    this.setState(CoreStore.getNotificationToastParams());
  }

  hideNotification(){
    CoreActions.sendNotificationToast(false, {title:"", msg: "", time: "", theme: ""});
  }

  countToHide(duration){
    //converting duration from sec to milliseconds
    duration *= 1000;
    let that = this;
    setTimeout(function() {
      that.hideNotification();
    }, duration);
  }

  render(){
    if(!this.state.visibleToast){
      return (<span></span>);
    }else{
      this.countToHide(this.state.time);
      console.log(this.state.time);
      let linkStyle;
      switch(this.state.theme){
        case 'success':
        linkStyle = style.success;
        break;

        case 'error':
        linkStyle = style.error;
        break;

        case 'info':
        linkStyle = style.info;
        break;

        default:
        // Do nothing
      }
      return(
        <div style={style.notificationContainer}>
          <div style={linkStyle} onClick={this.hideNotification.bind(this)}>
            <p style={style.notificationTitle}>{this.state.title}</p>
            <p style={style.notificationBody}>{this.state.msg}</p>
          </div>
        </div>
      );
    }
  }
}

module.exports = ToastComponent;
