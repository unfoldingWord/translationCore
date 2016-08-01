const React = require('react');
const ReactBootstrap = require('react-bootstrap');
const ReactDOM = require('react-dom');



class ToastNotificationApi extends React.Component {
  constructor(){
  super();
    this.state = {displayName: "Notify", key: 0};
  }

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
    var key         = this.key++;
    this.state[key] = { title: title, msg: msg, time: time, theme: theme };
    this.setState(this.state);
    this.countToHide(time, key);
  }

  countToHide(duration, key){
    var that = this;
    setTimeout(function() {
      that.hideNotification(key);
    }, duration);
  }

  hideNotification(key){
    delete this.state[key];
    this.setState(this.state);
  }

  render(){
    return(

    );
  }
}




class Item extends React.Component {
  constructor(){
  super();
    this.state = {displayName: "Item"};
  }

  hideNotification(){
    this.props.hideNotification(this.props.id);
  }

  render(){
    return(
      <div className={this.props.them} onClick={this.hideNotification.bind(this)}>
        <p className="notify-title">{this.props.title}</p>
        <p className="notify-body">{this.props.msg}</p>
      </div>
    );
  }
}
