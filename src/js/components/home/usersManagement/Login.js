import React, { Component } from 'react'
import { Glyphicon } from 'react-bootstrap';
import { shell } from 'electron';

class Login extends Component {
  constructor(props) {
    super(props);
    this.openDoor43AccountWindow = this.openDoor43AccountWindow.bind(this);
  }
  
  infoClickDoor43(e) {
    let positionCoord = e.target;
    let title = <strong>Door43 Information</strong>
    let text = (
      <div style={{ padding: "0 20px" }}>
        <p>
          Door43 is a free, online, revision-controlled content management
        <br />system for open-licensed biblical material.
        </p>
        <p>
          It provides free, remote storage and collaboration services
        <br />for creators and translators of biblical content.
        </p>
      </div>
    );
    this.props.actions.showPopover(title, text, positionCoord);
  }

  infoClickLocalUser(e) {
    let positionCoord = e.target;
    let title = <strong>Local User Information</strong>
    let text = (
      <div style={{ padding: "0 20px" }}>
        You can choose to be a local user and keep your identity anonymous.
    </div>
    );
    this.props.actions.showPopover(title, text, positionCoord);
  }

  openDoor43AccountWindow() {
    this.props.actions.confirmOnlineAction(() => {
      shell.openExternal('https://git.door43.org/user/sign_up');
    })
  }

  door43Popup() {
    return (
      <div>
        <p style={{ fontSize: 20, fontWeight: 'bold' }}>Coming Soon...</p>
        <p>TranslationCore does not currently support creating a Door43 account.
        You may create an account online at: <br />
          <a onClick={this.openDoor43AccountWindow}>https://git.door43.org/user/sign_up</a>
        </p>
      </div>
    )
  }

  loginHeaderDoor43() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        <img style={{ height: 64, width: 64 }} src="images/D43_LOGO.png" />
        <div>
          <span style={{ fontSize: 20, fontWeight: 'bold' }}>Log in With Door43</span>
          <Glyphicon
            glyph="info-sign"
            style={{ fontSize: "16px", cursor: 'pointer', marginLeft: '5px' }}
            onClick={(e) => this.infoClickDoor43(e)}
          />
        </div>
      </div>
    )
  }

  loginButtonsDoor43() {
    return (
      <div style={{ width: '100%' }}>
        <button
          className={"btn-prime"}
          style={{ width: "100%", margin: "40px 0px 10px" }}
          onClick={() => this.props.setView('login')}>
          Log in with Door43
            </button>
        <button
          className="btn-second"
          style={{ width: "100%", margin: "10px 0px 20px" }}
          onClick={() => this.props.actions.showAlert(this.door43Popup())}>
          Create New Account
            </button>
      </div>
    )
  }

  loginHeaderLocalUser() {
    return (
      <div>
        <span style={{ fontSize: 20, fontWeight: 'bold' }}>Create Local User</span>
        <Glyphicon
          glyph="info-sign"
          style={{ fontSize: "16px", cursor: 'pointer', marginLeft: '5px' }}
          onClick={(e) => this.infoClickLocalUser(e)}
        />
      </div>
    )
  }

  loginButtonLocalUser() {
    return (
      <button
        className="btn-second"
        style={{ width: "100%", margin: "40px 0px 20px" }}
        onClick={() => this.props.setView('local')}>
        Create Local Account
      </button>
    )
  }

  render() {
    return (
      <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column', margin: 'auto', width: 250 }}>
        {this.loginHeaderDoor43()}
        {this.loginButtonsDoor43()}
        {this.loginHeaderLocalUser()}
        {this.loginButtonLocalUser()}
      </div>
    )
  }
}

export default Login
