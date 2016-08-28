const React = require('react');

const Button = require('react-bootstrap/lib/Button.js');
const Modal = require('react-bootstrap/lib/Modal.js');
const CoreStore = require('../../../stores/CoreStore.js');
const CoreActions = require('../../../actions/CoreActions.js');
const style = require('./loginStyle');
const Login = require('./Login.js');
const Profile = require('./Profile');

class LoginModal extends React.Component {
  constructor() {
    super();
    this.state = { visibleLoginModal: false, profile: false };
  }

  componentWillMount() {
    CoreStore.addChangeListener(this.updateLoginModal.bind(this));
    CoreStore.addChangeListener(this.updateProfileVisibility.bind(this));
  }

  componentWillUnmount() {
    CoreStore.removeChangeListener(this.updateLoginModal.bind(this));
    CoreStore.removeChangeListener(this.updateProfileVisibility.bind(this));
  }

  updateLoginModal() {
    this.setState({ visibleLoginModal: CoreStore.getLoginModal() });
  }

  updateProfileVisibility() {
    this.setState({ profile: CoreStore.getProfileVisibility() });
  }

  close() {
    CoreActions.updateLoginModal(false);
  }

  render() {
    let display;
    if (this.state.profile === false) {
      display = React.createElement(Login, null);
    } else {
      display = React.createElement(Profile, null);
    }
    return React.createElement(
      'div',
      { style: style.modal },
      React.createElement(
        Modal,
        { show: this.state.visibleLoginModal, onHide: this.close.bind(this) },
        React.createElement(
          Modal.Header,
          { closeButton: true },
          React.createElement(
            Modal.Title,
            null,
            'Login Page'
          )
        ),
        React.createElement(
          Modal.Body,
          null,
          display
        ),
        React.createElement(
          Modal.Footer,
          null,
          React.createElement(
            Button,
            { type: "button", onClick: this.close.bind(this) },
            'Close'
          )
        )
      )
    );
  }
}

module.exports = LoginModal;