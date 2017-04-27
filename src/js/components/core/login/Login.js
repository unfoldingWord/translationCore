import React from 'react';
import { shell } from 'electron';
const Registration = require('./Registration.js');
const { Button, Row, Col, FormGroup, FormControl, utils } = require('react-bootstrap/lib');
const bootstrapUtils = utils.bootstrapUtils;
bootstrapUtils.addStyle(Button, 'blue');
const styles = {
    button: {
      backgroundColor: '#0277BD',
      color: 'white',
      width: '40%',
      fontWeight: 'bold',
      borderRadius: 4,
      borderWidth: 0,
      height: 34,
      outline: 'none',
    },
    buttonActive: {
      backgroundColor: '#C6C4C4',
      color: 'white',
      width: '40%',
      fontWeight: 'bold',
      borderRadius: 4,
      borderWidth: 0,
      height: 34,
      outline: 'none',
    }
  }

class Login extends React.Component {
  constructor() {
    super();
    this.state = {
      hovered: null,
      pressed: null
    }
  }
  onHover(id) {
    this.setState({ hovered: id })
  }
  onPress(tab, displayLogin) {
    switch (tab) {
      case 1:
        this.setState({ pressed: tab });
        this.props.handleSubmit(this.props.userdata);
        break;
      case 2:
        this.setState({ pressed: tab });
        this.props.onSwitchToLoginPage(!displayLogin);
        this.onPress(0);
        break;
      default:
        this.setState({ pressed: 0 });
        this.onHover(0);
        break;
    }
  }
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
                <button onMouseOver={() => this.onHover(1)} onMouseDown={() => this.onPress(1)}
                  onMouseOut={() => this.onPress(0)} onMouseUp={() => this.onPress(0)}
                  style={this.state.pressed != 1  && this.state.hovered != 1 ? Object.assign(styles.button, { marginBottom: '50px' }) :
                  Object.assign(styles.buttonActive, { marginBottom: '50px' })}>
                  Sign In
                </button>
                <div>
                  <h4>{"Don't have an account?"}</h4>
                  <button onMouseOver={() => this.onHover(2)} onMouseDown={() => shell.openExternal('https://git.door43.org/user/sign_up')}
                    onMouseOut={() => this.onPress(0)} onMouseUp={() => this.onPress(0)}
                    style={this.state.pressed != 2  && this.state.hovered != 2 ? styles.button : styles.buttonActive}
                    >
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
