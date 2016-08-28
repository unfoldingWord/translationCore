const React = require('react');
const CoreActions = require('../actions/CoreActions.js');
const CoreStore = require('../stores/CoreStore.js');
const style = require('./style');

class ToastComponent extends React.Component {
  constructor() {
    super();
    this.state = {
      visibleToast: false
    };
    this.updateToastVisibility = this.updateToastVisibility.bind(this);
    this.updateToastParams = this.updateToastParams.bind(this);
  }

  componentWillMount() {
    CoreActions.sendNotificationToast(false, { title: "", msg: "", time: "", theme: "" });
    CoreStore.addChangeListener(this.updateToastVisibility);
    CoreStore.addChangeListener(this.updateToastParams);
  }

  componentWillUnmount() {
    CoreStore.removeChangeListener(this.updateToastVisibility);
    CoreStore.removeChangeListener(this.updateToastParams);
  }

  updateToastVisibility() {
    this.setState({ visibleToast: CoreStore.getToastVisibility() });
  }

  updateToastParams() {
    this.setState(CoreStore.getNotificationToastParams());
  }

  hideNotification() {
    CoreActions.sendNotificationToast(false, { title: "", msg: "", time: "", theme: "" });
  }

  countToHide(duration) {
    //converting duration from sec to milliseconds
    duration *= 1000;
    let _this = this;
    setTimeout(function () {
      _this.hideNotification();
    }, duration);
  }

  render() {
    if (!this.state.visibleToast) {
      return React.createElement('span', null);
    } else {
      this.countToHide(this.state.time);
      let linkStyle;
      switch (this.state.theme) {
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
      return React.createElement(
        'div',
        { style: style.notificationContainer },
        React.createElement(
          'div',
          { style: linkStyle, onClick: this.hideNotification.bind(this) },
          React.createElement(
            'p',
            { style: style.notificationTitle },
            this.state.title
          ),
          React.createElement(
            'p',
            { style: style.notificationBody },
            this.state.msg
          )
        )
      );
    }
  }
}

module.exports = ToastComponent;