const React = require('react');

const remote = require('electron').remote;
const api = window.ModuleApi;
const { dialog } = remote;
const CoreActions = require('../../../actions/CoreActions.js');
const FormGroup = require('react-bootstrap/lib/FormGroup.js');
const ControlLabel = require('react-bootstrap/lib/ControlLabel.js');
const FormControl = require('react-bootstrap/lib/FormControl.js');
const Button = require('react-bootstrap/lib/Button.js');
const Grid = require('react-bootstrap/lib/Grid.js');
const Row = require('react-bootstrap/lib/Row.js');
const Col = require('react-bootstrap/lib/Col.js');
const style = require('./loginStyle');
const gogs = require('./GogsApi.js');
const Registration = require('./Registration');

class Login extends React.Component {
  constructor() {
    super();
    this.state = { userName: "", password: "", register: false };
  }
  handleSubmit(event) {
    var _this = this;
    var userdata = {
      username: this.state.userName,
      password: this.state.password
    };
    var Token = api.getAuthToken('gogs');
    var newuser = gogs(Token).login(userdata).then(function (userdata) {
      CoreActions.login(userdata);
      CoreActions.updateLoginModal(false);
      CoreActions.updateOnlineStatus(true);
      CoreActions.updateProfileVisibility(true);
      if (_this.props.success) {
        _this.props.success();
      }
    }).catch(function (reason) {
      //console.log(reason);
      if (reason.status === 401) {
        dialog.showErrorBox('Login Failed', 'Incorrect username or password');
      } else if (reason.hasOwnProperty('message')) {
        dialog.showErrorBox('Login Failed', reason.message);
      } else if (reason.hasOwnProperty('data')) {
        let errorMessage = reason.data;
        dialog.showErrorBox('Login Failed', errorMessage);
      } else {
        dialog.showErrorBox('Login Failed', 'Unknown Error');
      }
    });
  }
  handleUserName(e) {
    this.setState({ userName: e.target.value });
  }
  handlePassword(e) {
    this.setState({ password: e.target.value });
  }

  showRegistration() {
    this.setState({ register: true });
  }

  render() {
    if (this.state.register === true) {
      return React.createElement(Registration, null);
    } else {
      return React.createElement(
        'div',
        null,
        React.createElement(
          Row,
          { className: 'show-grid' },
          React.createElement(
            Col,
            { md: 12, sm: 12, xs: 12 },
            React.createElement(
              FormGroup,
              { controlId: 'login-form' },
              React.createElement(
                ControlLabel,
                null,
                'Door43 Account'
              ),
              React.createElement('br', null),
              React.createElement('br', null),
              React.createElement(FormControl, { type: 'text', placeholder: 'Username',
                style: { width: '100%', marginBottom: '10px' },
                onChange: this.handleUserName.bind(this) }),
              React.createElement(FormControl, { type: 'password',
                placeholder: 'Password',
                style: { width: '100%' },
                onChange: this.handlePassword.bind(this) })
            ),
            React.createElement(
              Button,
              { bsStyle: 'primary',
                type: 'submit',
                onClick: this.handleSubmit.bind(this),
                style: { width: '100%', margin: 'auto' } },
              'Sign In'
            ),
            React.createElement(
              'span',
              null,
              "Don't have an account?"
            ),
            React.createElement(
              Button,
              { onClick: this.showRegistration.bind(this),
                bsStyle: 'link',
                style: { color: 'blue', display: 'inline' } },
              'Register'
            ),
            React.createElement('br', null),
            React.createElement('br', null)
          )
        )
      );
    }
  }
}

module.exports = Login;