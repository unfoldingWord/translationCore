const React = require('react');

const remote = require('electron').remote;
const api = window.ModuleApi;
const {dialog} = remote;
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
    this.state = {userName: "", password: "", register: false};
  }
  handleSubmit(event) {
    var _this = this;
    var userdata = {
      username: this.state.userName,
      password: this.state.password
    };
    var Token = api.getAuthToken('gogs');
    var newuser = gogs(Token).login(userdata).then(function(userdata) {
      CoreActions.login(userdata);
      CoreActions.updateLoginModal(false);
      CoreActions.updateOnlineStatus(true);
      CoreActions.updateProfileVisibility(true);
      if (_this.props.success) {
        _this.props.success();
      }
    }).catch(function(reason) {
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
    this.setState({userName: e.target.value});
  }
  handlePassword(e) {
    this.setState({password: e.target.value});
  }

  showRegistration() {
    this.setState({register: true});
  }

  render() {
    if (this.state.register === true) {
      return (
        <Registration />
      );
    }else{
      return (
        <div>
          <Row className="show-grid">
            <Col md={12} sm={12} xs={12}>

                <FormGroup controlId="login-form">
                    <ControlLabel>Door43 Account</ControlLabel><br/><br/>
                    <FormControl type="text" placeholder="Username"
                                 style={{width: '100%', marginBottom: '10px'}}
                                 onChange={this.handleUserName.bind(this)}/>
                    <FormControl type="password"
                                 placeholder="Password"
                                 style={{width: '100%'}}
                                 onChange={this.handlePassword.bind(this)}/>
                </FormGroup>
                <Button bsStyle="primary"
                        type="submit"
                        onClick={this.handleSubmit.bind(this)}
                        style={{width: '100%', margin: 'auto'}}>
                        Sign In
                </Button>

                <span>{"Don't have an account?"}</span>
                <Button onClick={this.showRegistration.bind(this)}
                        bsStyle="link"
                        style={{color: 'blue', display: 'inline'}}>
                        Register
                </Button><br/><br/>
            </Col>
           </Row>
        </div>
      );
    }
  }
}

module.exports = Login;
