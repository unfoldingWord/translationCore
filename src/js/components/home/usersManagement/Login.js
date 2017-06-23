import React, { Component } from 'react'
import { shell } from 'electron';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { Card } from 'material-ui/Card';
import TextField from 'material-ui/TextField';
import { Glyphicon } from 'react-bootstrap';
class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: null,
      password: null
    };
  }

  infoClick(e) {
    let positionCoord = e.target;
    let title = <strong>Door43 Information</strong>
    let text =
      (<div style={{ padding: "0 20px" }}>
        <p>
          Door43 is a free, online, revision-controlled content management
      <br />system for open-licensed biblical material.
      </p>
        <p>
          It provides free, remote storage and collaboration services
      <br />for creators and translators of biblical content.
      </p>
      </div>);
    this.props.showPopover(title, text, positionCoord)
  }

  openDoor43AccountWindow(){
    shell.openExternal('https://git.door43.org/user/sign_up')
  }

  render() {
    const underLineColor = "var(--accent-color-dark)"
    let u = this.state.username
    let p = this.state.password
    let disabledButton = (u == null || u == "") || (p == null || p == "")
    return (
      <MuiThemeProvider>
        <Card style={{
          width: '100%', height: '100%', background: 'white', padding: '20px', marginTop: '10px', display: 'flex',
          alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 350 }}>
            <img style={{ height: 64, width: 64 }} src="src/images/D43_LOGO.png" />
            <div>
              <span style={{ fontSize: 20, fontWeight: 'bold' }}>Log in With Door43</span>
              <Glyphicon
                glyph="info-sign"
                style={{ fontSize: "16px", cursor: 'pointer', marginLeft: '5px' }}
                onClick={(e) => this.infoClick(e)}
              />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            <TextField
              fullWidth={true}
              floatingLabelText="Username"
              underlineFocusStyle={{ borderColor: underLineColor }}
              floatingLabelStyle={{ color: "var(--text-color-dark)", opacity: "0.3", fontWeight: "500" }}
              onChange={e => this.setState({ username: e.target.value })}
            />
            <TextField
              fullWidth={true}
              floatingLabelText="Password"
              type="password"
              underlineFocusStyle={{ borderColor: underLineColor }}
              floatingLabelStyle={{ color: "var(--text-color-dark)", opacity: "0.3", fontWeight: "500" }}
              onChange={e => this.setState({ password: e.target.value })}
            />
          </div>
          <div>
            <button
              className={disabledButton ? "btn-prime-reverse" : "btn-prime"}
              disabled={disabledButton}
              style={{ width: "100%", margin: "40px 0px 10px" }}
              onClick={() => this.props.loginUser(this.state)}>
              Log In
            </button>
            <button
              className="btn-second"
              style={{ width: "100%", margin: "10px 0px 20px" }}
              onClick={() => this.props.showAlert(
                <div>
                <p style={{fontSize: 20, fontWeight: 'bold'}}>Coming Soon...</p>
                <p>TranslationCore does not currently support creating a Door43 account. 
                You may create an account online at: <br/><a onClick={this.openDoor43AccountWindow}>https://git.door43.org/user/sign_up</a> </p>
                </div>
              )}>
              Create Door43 Account
            </button>
          </div>
        </Card>
      </MuiThemeProvider>
    )
  }
}

export default Login
