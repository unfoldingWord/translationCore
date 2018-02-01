import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Glyphicon } from 'react-bootstrap';
import TextField from 'material-ui/TextField';

class LoginDoor43Account extends Component {
  constructor (props) {
    super(props);
    this.state = {
      username: null,
      password: null
    };
    this._handleKeyPress = this._handleKeyPress.bind(this);
    this.infoClickDoor43 = this.infoClickDoor43.bind(this);
    this.loginHeaderDoor43 = this.loginHeaderDoor43.bind(this);
    this.loginTextFields = this.loginTextFields.bind(this);
    this.loginButtons = this.loginButtons.bind(this);
  }

  infoClickDoor43 (e) {
    const {translate} = this.props;
    let positionCoord = e.target;
    let title = <strong>{translate('home.users.login.door43_info_title', {door43: translate('_.door43')})}</strong>;
    let text = (
      <div style={{padding: '0 20px'}}>
        {translate('home.users.login.door43_information', {door43: translate('_.door43')})}
      </div>
    );
    this.props.actions.showPopover(title, text, positionCoord);
  }

  loginHeaderDoor43 () {
    const {translate} = this.props;
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%'
      }}>
        <img style={{height: 64, width: 64}} src="images/D43_LOGO.png"/>
        <div>
          <span
            style={{fontSize: 20, fontWeight: 'bold'}}>{translate('home.users.login.with_door43', {door43: translate('_.door43')})}</span>
          <Glyphicon
            glyph="info-sign"
            style={{fontSize: '16px', cursor: 'pointer', marginLeft: '5px'}}
            onClick={(e) => this.infoClickDoor43(e)}
          />
        </div>
      </div>
    );
  }

  loginTextFields () {
    const {translate} = this.props;
    const underLineColor = 'var(--accent-color-dark)';
    const setFocusInputField = (input) => {this.focusInputField = input};
    return (
      <div onKeyPress={this._handleKeyPress} style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%'
      }}>
        <TextField
          className="Username"
          fullWidth={true}
          floatingLabelText={translate('username')}
          underlineFocusStyle={{borderColor: underLineColor}}
          floatingLabelStyle={{
            color: 'var(--text-color-dark)',
            opacity: '0.3',
            fontWeight: '500'
          }}
          onChange={e => this.setState({username: e.target.value})}
          ref={setFocusInputField}
        />
        <TextField
          className="Passowrd"
          fullWidth={true}
          floatingLabelText={translate('password')}
          type="password"
          underlineFocusStyle={{borderColor: underLineColor}}
          floatingLabelStyle={{
            color: 'var(--text-color-dark)',
            opacity: '0.3',
            fontWeight: '500'
          }}
          onChange={e => this.setState({password: e.target.value})}
        />
      </div>
    );
  }

  loginButtons () {
    let disabledButton = (this.state.username === null ||
      this.state.username === '') ||
      (this.state.password === null || this.state.password === '');
    return (
      <div style={{width: '100%'}}>
        <button
          className={disabledButton ? 'btn-prime-reverse' : 'btn-prime'}
          disabled={disabledButton}
          style={{width: '100%', margin: '40px 0px 10px'}}
          onClick={() => this.props.loginUser(this.state)}>
          Log in
        </button>
        <button
          className="btn-second"
          style={{width: '100%', margin: '10px 0px 20px'}}
          onClick={() => this.props.setView('main')}>
          Go Back
        </button>
      </div>
    );
  }

  _handleKeyPress (e) {
    if (e.key === 'Enter') {
      this.props.loginUser(this.state);
    }
  }

  componentDidMount () {
    this.focusInputField && this.focusInputField.focus();
  }

  render () {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        margin: 'auto',
        width: 250
      }}>
        {this.loginHeaderDoor43()}
        {this.loginTextFields()}
        {this.loginButtons()}
      </div>
    );
  }
}

LoginDoor43Account.propTypes = {
  translate: PropTypes.func.isRequired,
  actions: PropTypes.shape({
    showPopover: PropTypes.func.isRequired
  }),
  loginUser: PropTypes.func.isRequired,
  setView: PropTypes.func.isRequired
};

export default LoginDoor43Account;
