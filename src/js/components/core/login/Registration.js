/**
 * @description This file registers a user then logs them in.
 * @author Ian Hoegen
 **/

const React = require('react');

const remote = require('electron').remote;
const {dialog} = remote;

const FormGroup = require('react-bootstrap/lib/FormGroup.js');
const FormControl = require('react-bootstrap/lib/FormControl.js');
const Button = require('react-bootstrap/lib/Button.js');
var Token = window.ModuleApi.getAuthToken('gogs');
const CoreActions = require('../../../actions/CoreActions.js');
const GogsApi = require('./GogsApi');
const ACCOUNT_CREATION_ERROR = 'Account Creation Error';
const UNKNOWN_ERROR = 'Unknown Error';
const EMPTY = {
  email: 'Email is empty',
  username: 'Username is empty',
  password: 'Password is empty',
  confirm: 'Confirm password is empty'
};
const INVALID = {
  email: 'Email is not valid',
  password: 'Passwords do not match'
};
const ENTER = {
  username: 'Username',
  email: 'Email',
  password: 'Password',
  confirm: 'Confirm Password'
};

const Registration = React.createClass({
  getInitialState: function() {
    return {
      email: '',
      password: '',
      username: '',
      confirm: ''
    };
  },
  checkPass: function() {
    var password = this.state.password;
    var confirm = this.state.confirm;
    if (password === confirm && confirm.length > 0) {
      return 'success';
    } else if (password !== confirm && confirm.length > 0) {
      return 'error';
    }
  },
  handleUser: function(e) {
    this.setState({username: e.target.value});
  },
  handleEmail: function(e) {
    this.setState({email: e.target.value});
  },
  handlePass: function(e) {
    this.setState({password: e.target.value});
  },
  handleConfirm: function(e) {
    this.setState({confirm: e.target.value});
  },
  createUser: function() {
    var user = {
      login_name: this.state.username,
      username: this.state.username,
      password: this.state.password,
      email: this.state.email
    };
    var emailValid = this.validateEmail();
    var passwordMatch = this.checkPass();
    var unLen = user.username.length;
    if (emailValid === 'success' && passwordMatch === 'success' && unLen > 0) {
      GogsApi(Token)
      .createAccount(user)
      .then(function(data) {
        CoreActions.login(data);
        CoreActions.updateLoginModal(false);
        CoreActions.updateOnlineStatus(true);
        CoreActions.updateProfileVisibility(true);
      })
      .catch(function(reason) {
        console.log(reason);
        if (reason.hasOwnProperty('message')) {
          dialog.showErrorBox('', reason.message);
        } else if (reason.hasOwnProperty('data')) {
          if (reason.data === "") {
            console.error("Invalid Token");
          } else {
            let errorMessage = JSON.parse(reason.data);
            console.error(errorMessage.message);
            dialog.showErrorBox(ACCOUNT_CREATION_ERROR, errorMessage.message);
          }
        } else {
          dialog.showErrorBox(ACCOUNT_CREATION_ERROR, UNKNOWN_ERROR);
          console.log(reason);
        }
      });
    } else if (unLen === 0) {
      dialog.showErrorBox(ACCOUNT_CREATION_ERROR, EMPTY.username);
    } else if (this.state.email.length === 0) {
      dialog.showErrorBox(ACCOUNT_CREATION_ERROR, EMPTY.email);
    } else if (emailValid !== 'success') {
      dialog.showErrorBox(ACCOUNT_CREATION_ERROR, INVALID.email);
    } else if (this.state.password.length === 0) {
      dialog.showErrorBox(ACCOUNT_CREATION_ERROR, EMPTY.password);
    } else if (this.state.confirm.length === 0) {
      dialog.showErrorBox(ACCOUNT_CREATION_ERROR, EMPTY.confirm);
    } else if (passwordMatch !== 'success') {
      dialog.showErrorBox(ACCOUNT_CREATION_ERROR, INVALID.password);
    }
  },
  validateEmail: function() {
    var email = this.state.email;
    if (email.length > 0) {
      var reg = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,9}(?:\.[a-z]{2})?)$/;
      return reg.test(email) ? 'success' : 'error';
    }
  },
  render: function() {
    return (
        <div>
          <FormGroup controlId="username">
            <FormControl type="text" placeholder={ENTER.username} onChange={this.handleUser}/>
          </FormGroup>
          <FormGroup controlId="email" validationState={this.validateEmail()}>
            <FormControl type="text" placeholder={ENTER.email} onChange={this.handleEmail}/>
            <FormControl.Feedback />
          </FormGroup>
          <FormGroup controlId="password" validationState={this.checkPass()}>
            <FormControl type="password" placeholder={ENTER.password} onChange={this.handlePass}/>
            <FormControl.Feedback />
          </FormGroup>
          <FormGroup controlId="confirm" validationState={this.checkPass()}>
            <FormControl type="password" placeholder={ENTER.confirm} onChange={this.handleConfirm}/>
            <FormControl.Feedback />
          </FormGroup>
          <Button onClick={this.createUser} bsStyle="primary">
            Create Account
          </Button>
        </div>
    );
  }
});

module.exports = Registration;
