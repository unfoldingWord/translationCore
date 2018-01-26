import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Glyphicon } from 'react-bootstrap';
import open from 'open';

class Login extends Component {
  constructor(props) {
    super(props);
    this.openDoor43AccountWindow = this.openDoor43AccountWindow.bind(this);
  }

  infoClickDoor43(e) {
    const {translate} = this.props;
    let positionCoord = e.target;
    let title = <strong>{translate('home.users.login.door43_info_title')}</strong>;
    let text = (
      <div style={{ padding: "0 20px" }}>
        {translate('home.users.login.door43_information')}
      </div>
    );
    this.props.actions.showPopover(title, text, positionCoord);
  }

  infoClickLocalUser(e) {
    const {translate} = this.props;
    let positionCoord = e.target;
    let title = <strong>{translate('home.users.login.guest_info_title')}</strong>;
    let text = (
      <div style={{ padding: "0 20px" }}>
        {translate('home.users.login.guest_information')}
      </div>
    );
    this.props.actions.showPopover(title, text, positionCoord);
  }

  openDoor43AccountWindow() {
    this.props.actions.confirmOnlineAction(() => {
      open('https://git.door43.org/user/sign_up');
    });
  }

  door43Popup() {
    const {translate} = this.props;
    return (
      <div>
        <p style={{ fontSize: 20, fontWeight: 'bold' }}>{translate('coming_soon')}</p>
        <p>{translate('home.users.login.create_account_not_available')}<br />
          <a onClick={this.openDoor43AccountWindow}>https://git.door43.org/user/sign_up</a>
        </p>
      </div>
    );
  }

  loginHeaderDoor43() {
    const {translate} = this.props;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        <img style={{ height: 64, width: 64 }} src="images/D43_LOGO.png" />
        <div>
          <span style={{ fontSize: 20, fontWeight: 'bold' }}>{translate('home.users.login.with_door43')}</span>
          <Glyphicon
            glyph="info-sign"
            style={{ fontSize: "16px", cursor: 'pointer', marginLeft: '5px' }}
            onClick={(e) => this.infoClickDoor43(e)}
          />
        </div>
      </div>
    );
  }

  loginButtonsDoor43() {
    const {translate} = this.props;
    return (
      <div style={{ width: '100%' }}>
        <button
          className={"btn-prime"}
          style={{ width: "100%", margin: "40px 0px 10px" }}
          onClick={() => this.props.setView('login')}>
          {translate('home.users.login.with_door43')}
        </button>
        <button
          className="btn-second"
          style={{ width: "100%", margin: "10px 0px 20px" }}
          onClick={() => this.props.actions.showAlert(this.door43Popup())}>
          {translate('home.users.login.create_account')}
        </button>
      </div>
    );
  }

  loginHeaderLocalUser() {
    const {translate} = this.props;
    return (
      <div>
        <span style={{ fontSize: 20, fontWeight: 'bold' }}>{translate('home.users.login.as_guest')}</span>
        <Glyphicon
          glyph="info-sign"
          style={{ fontSize: "16px", cursor: 'pointer', marginLeft: '5px' }}
          onClick={(e) => this.infoClickLocalUser(e)}
        />
      </div>
    );
  }

  loginButtonLocalUser() {
    const {translate} = this.props;
    return (
      <button
        className="btn-second"
        style={{ width: "100%", margin: "40px 0px 20px" }}
        onClick={() => this.props.setView('local')}>
        {translate('home.users.login.as_guest')}
      </button>
    );
  }

  render() {
    return (
      <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column', margin: 'auto', width: 250 }}>
        {this.loginHeaderDoor43()}
        {this.loginButtonsDoor43()}
        {this.loginHeaderLocalUser()}
        {this.loginButtonLocalUser()}
      </div>
    );
  }
}

Login.propTypes = {
  actions: PropTypes.shape({
      showAlert: PropTypes.func.isRequired,
      confirmOnlineAction: PropTypes.func.isRequired,
      showPopover: PropTypes.func.isRequired
  }),
  translate: PropTypes.func.isRequired,
  setView: PropTypes.func.isRequired
};

export default Login;
