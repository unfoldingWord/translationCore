import React, { Component } from 'react';
import { Glyphicon } from 'react-bootstrap';
import TextField from 'material-ui/TextField';

class LoginDoor43Account extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: null,
      password: null
    };
    this._handleKeyPress = this._handleKeyPress.bind(this);
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
    this.props.actions.showPopover(title, text, positionCoord)
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

  loginTextFields() {
    const underLineColor = "var(--accent-color-dark)";
    return (
      <div onKeyPress={this._handleKeyPress} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
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
    )
  }

  loginButtons() {
    let disabledButton = (this.state.username == null || this.state.username == "") ||
      (this.state.password == null || this.state.password == "");
    return (
      <div style={{ width: '100%' }}>
        <button
          className={disabledButton ? "btn-prime-reverse" : "btn-prime"}
          disabled={disabledButton}
          style={{ width: "100%", margin: "40px 0px 10px" }}
          onClick={() => this.props.loginUser(this.state)}>
          Log in
            </button>
        <button
          className="btn-second"
          style={{ width: "100%", margin: "10px 0px 20px" }}
          onClick={() => this.props.setView('main')}>
          Go Back
            </button>
      </div>
    )
  }

  _handleKeyPress (e) {
    if (e.key === 'Enter') {
      this.props.loginUser(this.state)
    }
  }

  render() {
    return (
      <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column', margin: 'auto', width: 250 }}>
        {this.loginHeaderDoor43()}
        {this.loginTextFields()}
        {this.loginButtons()}
      </div>
    );
  }
}

export default LoginDoor43Account;