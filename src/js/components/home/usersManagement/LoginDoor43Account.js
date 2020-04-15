import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Glyphicon } from 'react-bootstrap';
import TextField from 'material-ui/TextField';
import D43Logo from '../../../../images/D43_LOGO.png';

/**
 * Renders the login and back buttons
 * @param {object} state - the component state
 * @param {func} onLogin - callback when the login button is clicked
 * @param {func} onBack - callback when the back button is clicked
 * @param {func} translate - the localization function
 * @return {*}
 * @constructor
 */
const LoginButtons = ({
  state, onLogin, onBack, translate,
}) => {
  const hasUsername = state.username && state.username !== '';
  const hasPassword = state.password && state.password !== '';
  let disabled = !hasUsername || !hasPassword;

  return (
    <div style={{ width: '100%' }}>
      <button
        id="login-btn"
        className={disabled ? 'btn-prime-reverse' : 'btn-prime'}
        disabled={disabled}
        style={{ width: '100%', margin: '40px 0px 10px' }}
        onClick={onLogin}>
        {translate('buttons.log_in_button')}
      </button>
      <button
        id="setview-btn"
        className="btn-second"
        style={{ width: '100%', margin: '10px 0px 20px' }}
        onClick={onBack}>
        {translate('buttons.back_button')}
      </button>
    </div>
  );
};

LoginButtons.propTypes = {
  state: PropTypes.object.isRequired,
  onLogin: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  translate: PropTypes.func.isRequired,
};

/**
 * Renders the login input fields
 * @param {func} onUsernameChange - callback when the username changes
 * @param {func} onPasswordChange - callback when the password changes
 * @param {func} onKeyPress - callback when a key is pressed on the div (for capturing return key)
 * @param {func} translate - the localization function
 * @return {*}
 * @constructor
 */
const LoginTextFields = ({
  onUsernameChange, onPasswordChange, onKeyPress, translate,
}) => {
  const underLineColor = 'var(--accent-color-dark)';
  return (
    <div onKeyPress={onKeyPress} style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: '100%',
    }}>
      <TextField
        id="username-input"
        className="Username"
        fullWidth={true}
        floatingLabelText={translate('users.username')}
        underlineFocusStyle={{ borderColor: underLineColor }}
        floatingLabelStyle={{
          color: 'var(--text-color-dark)',
          opacity: '0.3',
          fontWeight: '500',
        }}
        onChange={e => onUsernameChange(e.target.value)}
        autoFocus={true}
      />
      <TextField
        id="password-input"
        className="Passowrd"
        fullWidth={true}
        floatingLabelText={translate('users.password')}
        type="password"
        underlineFocusStyle={{ borderColor: underLineColor }}
        floatingLabelStyle={{
          color: 'var(--text-color-dark)',
          opacity: '0.3',
          fontWeight: '500',
        }}
        onChange={e => onPasswordChange(e.target.value)}
      />
    </div>
  );
};

LoginTextFields.propTypes = {
  onUsernameChange: PropTypes.func.isRequired,
  onPasswordChange: PropTypes.func.isRequired,
  onKeyPress: PropTypes.func.isRequired,
  translate: PropTypes.func.isRequired,
};

/**
 * Renders the Door43 Login form.
 *
 * @class
 *
 * @property {func} translate - the localization function
 * @property {func} loginUser - callback to log in the user
 * @property {func} setView - to set the current login screen.
 * @property {func} showPopover - callback to display a popover
 */
class LoginDoor43Account extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: null,
      password: null,
    };
    this._handleKeyPress = this._handleKeyPress.bind(this);
    this._handleInfoClick = this._handleInfoClick.bind(this);
    this._handleLogin = this._handleLogin.bind(this);
    this._handleBack = this._handleBack.bind(this);
    this._handlePasswordChange = this._handlePasswordChange.bind(this);
    this._handleUsernameChange = this._handleUsernameChange.bind(this);
  }

  componentDidCatch(error, info) {
    console.error(error, info);
  }

  _handleInfoClick(e) {
    const { translate } = this.props;
    let positionCoord = e.target;
    let title = <strong>{translate('users.d43_information',
      { door43: translate('_.door43') })}</strong>;
    let text = (
      <div style={{ padding: '0 20px' }}>
        {translate('users.d43_info_1',
          { door43: translate('_.door43') })}
      </div>
    );
    this.props.showPopover(title, text, positionCoord);
  }

  _handleKeyPress(e) {
    if (e.key === 'Enter') {
      this._handleLogin();
    }
  }

  _handleLogin() {
    const { loginUser } = this.props;
    const { username, password } = this.state;

    loginUser({
      username,
      password,
    });
  }

  _handleBack() {
    const { setView } = this.props;
    setView('main');
  }

  _handlePasswordChange(password) {
    this.setState({ password });
  }

  _handleUsernameChange(username) {
    this.setState({ username });
  }

  render() {
    const { translate } = this.props;

    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        margin: 'auto',
        width: 250,
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
        }}>
          <img style={{ height: 64, width: 64 }} src={D43Logo}/>
          <div>
            <span style={{ fontSize: 20, fontWeight: 'bold' }}>
              {
                translate('buttons.d43_login_button', { door43: translate('_.door43') })
              }
            </span>
            <Glyphicon
              id="info-btn"
              glyph="info-sign"
              style={{
                fontSize: '16px', cursor: 'pointer', marginLeft: '5px',
              }}
              onClick={this._handleInfoClick}
            />
          </div>
        </div>
        <LoginTextFields onUsernameChange={this._handleUsernameChange}
          onPasswordChange={this._handlePasswordChange}
          translate={translate}
          onKeyPress={this._handleKeyPress}/>
        <LoginButtons state={this.state}
          translate={translate}
          onLogin={this._handleLogin}
          onBack={this._handleBack}/>
      </div>
    );
  }
}

LoginDoor43Account.propTypes = {
  translate: PropTypes.func.isRequired,
  showPopover: PropTypes.func.isRequired,
  loginUser: PropTypes.func.isRequired,
  setView: PropTypes.func.isRequired,
};

export default LoginDoor43Account;
