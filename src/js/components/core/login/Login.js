import React from 'react';
import { shell } from 'electron';
const Registration = require('./Registration.js');
const { Row, Col, FormGroup, FormControl } = require('react-bootstrap/lib');

class Login extends React.Component {

  render() {
    let { displayLogin } = this.props;
    if (!displayLogin) {
      return (
        <Col md={12} sm={12} xs={12} style={{ marginTop: "50px" }}>
          <center>
            <Registration back={() => this.props.onSwitchToLoginPage(!displayLogin)} />
          </center>
        </Col>
      );
    } else {
      return (
        <div>
          <Row className="show-grid">
            <Col md={12} sm={12} xs={12} style={{ marginTop: "50px" }}>
              <center>
                <h4>Welcome!</h4>
                <FormGroup controlId="login-form">
                  <FormControl type="text" placeholder="Username"
                    style={{ width: '40%', margin: '15px' }}
                    onChange={this.props.onHandleUserName} />
                  <FormControl type="password"
                    placeholder="Password"
                    style={{ width: '40%' }}
                    onChange={this.props.onHandlePassword} />
                </FormGroup>
                <button className="btn-prime" onClick={() => this.props.handleSubmit(this.props.userdata)}>
                  Sign In
                </button>
                <div>
                  <h4>Don't have an account?</h4>
                  <button className="btn-prime" onClick={() => shell.openExternal('https://git.door43.org/user/sign_up')}>
                    Create an Account
                </button><br /><br />
                </div>
              </center>
            </Col>
          </Row>
        </div>
      );
    }
  }
}

module.exports = Login;
