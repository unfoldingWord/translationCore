import React, { Component } from 'react';
import PropTypes from 'prop-types';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { Checkbox, TextField } from 'material-ui';
import { Glyphicon, Modal } from 'react-bootstrap';
import { connect } from 'react-redux';
import { withLocalize } from 'react-localize-redux';
import { LocaleSelectListContainer } from '../../../containers/Locale';
import { setLanguage } from '../../../actions/LocaleActions';
import LocaleSettingsDialog from '../../../containers/LocaleSettingsDialogContainer';
import { LOCALE_DIR } from '../../../common/constants';
import TermsAndConditionsPage from './pages/TermsAndConditionsPage';
import StatementOfFaithPage from './pages/StatementOfFaithPage';
import CreativeCommonsPage from './pages/CreativeCommonsPage';

export const INFO_TERMS = 'terms_and_conditions';
export const INFO_CREATIVE = 'creative_commons';
export const INFO_FAITH = 'statement_of_faith';

/**
 * The terms and conditions checkbox
 * @param translate
 * @param checked
 * @param onCheck
 * @param onTermsClick
 * @return {*}
 * @constructor
 */
const AgreementCheckbox = ({
  translate, checked, onCheck, onTermsClick,
}) => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    flexWrap: 'wrap',
  }}>
    <Checkbox
      checked={checked}
      style={{ width: 'auto' }}
      iconStyle={{ fill: 'black' }}
      labelStyle={{
        color: 'var(--reverse-color)',
        opacity: '0.7',
        fontWeight: '500',
      }}
      onCheck={onCheck}
    />
    <span>{translate('users.read_and_agree')}</span>
    &nbsp;
    <a
      style={{ cursor: 'pointer', textDecoration: 'none' }}
      onClick={onTermsClick}>
      {translate('users.terms_and_conditions')}
    </a>
  </div>
);

AgreementCheckbox.propTypes = {
  translate: PropTypes.func.isRequired,
  checked: PropTypes.bool.isRequired,
  onCheck: PropTypes.func.isRequired,
  onTermsClick: PropTypes.func.isRequired,
};

/**
 * The username input field
 * @param translate
 * @param value
 * @param onChange
 * @return {*}
 * @constructor
 */
const UsernameInput = ({
  translate, value, onChange,
}) => (
  <TextField
    autoFocus
    className="Username"
    value={value}
    floatingLabelText={translate('users.username')}
    underlineFocusStyle={{ borderColor: 'var(--accent-color-dark)' }}
    floatingLabelStyle={{
      color: 'var(--text-color-dark)',
      opacity: '0.3',
      fontWeight: '500',
    }}
    onChange={onChange}/>
);

UsernameInput.propTypes = {
  translate: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

class CreateLocalAccount extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      agreed: false,
      showModal: false,
      modalTitle: null,
      modalContent: null,
      localeOpen: false,
    };
    this.infoPopup = this.infoPopup.bind(this);
    this.handleLocaleChange = this.handleLocaleChange.bind(this);
    this.handleUsernameChange = this.handleUsernameChange.bind(this);
    this.handleAgreedChange = this.handleAgreedChange.bind(this);
    this.handleLocaleInfoClick = this.handleLocaleInfoClick.bind(this);
    this.handleLocaleClose = this.handleLocaleClose.bind(this);
  }

  localUserWarning() {
    const { translate } = this.props;
    const { username } = this.state;
    return (
      <div>
        <p style={{ fontSize: 20, fontWeight: 'bold' }}>{translate(
          'users.attention')}</p>
        <p>
          {translate('users.known_as_username', { username })}
        </p>
        <p>
          {translate('users.known_not_comfortable', { username })}
        </p>
      </div>
    );
  }

  loginButtons() {
    const loginEnabled = !!(this.state.username &&
      this.state.agreed);
    const { translate } = this.props;
    const continueText = translate('buttons.continue_button');

    const callback = (result) => {
      if (result === continueText) {
        this.props.loginUser(
          { username: this.state.username }, true);
      }
      this.props.actions.closeAlert();
    };
    return (
      <div style={{
        display: 'flex', width: '100%', justifyContent: 'center',
      }}>
        <button
          className="btn-second"
          style={{ width: 150, margin: '40px 10px 0px 0px' }}
          onClick={() => this.props.setView('main')}>
          {translate('buttons.back_button')}
        </button>
        <button
          className={loginEnabled ? 'btn-prime' : 'btn-prime-reverse'}
          disabled={!loginEnabled}
          style={{ width: 200, margin: '40px 0px 0px 10px' }}
          onClick={() => this.props.actions.openOptionDialog(
            this.localUserWarning(), callback, continueText,
            translate('buttons.cancel_button'))}>
          {continueText}
        </button>
      </div>
    );
  }

  infoPopup(type) {
    const { translate } = this.props;
    let show = !!type;
    let content;
    let title;

    switch (type) {
    case INFO_TERMS:
      title =
          <strong>{translate('users.terms_and_conditions')}</strong>;
      content = <TermsAndConditionsPage
        onFaithClick={() => this.infoPopup(INFO_FAITH)}
        onCreativeClick={() => this.infoPopup(INFO_CREATIVE)}
        translate={translate}
        onBackClick={() => this.infoPopup(null)}/>;
      break;
    case INFO_CREATIVE:
      title =
          <strong>{translate('project_validation.creative_commons')}</strong>;
      content =
          <CreativeCommonsPage onBackClick={() => this.infoPopup(INFO_TERMS)}
            translate={translate}/>;
      break;
    case INFO_FAITH:
      title =
          <strong>{translate('users.statement_of_faith')}</strong>;
      content =
          <StatementOfFaithPage onBackClick={() => this.infoPopup(INFO_TERMS)}
            translate={translate}/>;
      break;
    default:
      content = <div/>;
      break;
    }
    this.setState({
      showModal: show, modalTitle: title, modalContent: content,
    });
  }

  handleLocaleChange(language) {
    const {
      setLanguage, setActiveLanguage, addTranslationForLanguage,
    } = this.props;
    setLanguage(language, setActiveLanguage, addTranslationForLanguage, LOCALE_DIR);
  }

  handleUsernameChange(event) {
    this.setState({ username: event.target.value });
  }

  handleAgreedChange() {
    const { agreed } = this.state;

    this.setState({ agreed: !agreed });
  }

  handleLocaleInfoClick() {
    this.setState({ localeOpen: true });
  }

  handleLocaleClose() {
    this.setState({ localeOpen: false });
  }

  render() {
    const { translate } = this.props;
    const {
      username, agreed, localeOpen,
    } = this.state;
    return (
      <MuiThemeProvider>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'column',
          width: '100%',
        }}>
          <div style={{ flexGrow: 1, textAlign: 'center' }}>
            <h2>
              {translate('users.new_guest')}
            </h2>
            <p style={{ color: 'grey' }}>
              {translate('users.visible')}
            </p>

            <UsernameInput translate={translate}
              value={username}
              onChange={this.handleUsernameChange}/>

            <AgreementCheckbox translate={translate}
              checked={agreed}
              onTermsClick={() => {
                this.infoPopup(INFO_TERMS);
              }}
              onCheck={this.handleAgreedChange}/>

            {this.loginButtons()}
          </div>

          <div style={{ textAlign: 'center' }}>

            <h3>
              {translate('user_locale')}
              <Glyphicon
                glyph="info-sign"
                onClick={this.handleLocaleInfoClick}
                style={{
                  fontSize: '16px', cursor: 'pointer', marginLeft: '5px',
                }}/>
            </h3>
            <LocaleSelectListContainer onChange={this.handleLocaleChange} translate={translate}/>
          </div>

          <LocaleSettingsDialog open={localeOpen}
            translate={translate}
            onClose={this.handleLocaleClose}/>

          {/* do we need this anymore ?? */}
          <Modal show={this.state.showModal}
            onHide={() => this.setState({ showModal: false })} bsSize="lg">
            <Modal.Header style={{ backgroundColor: 'var(--accent-color-dark)' }}>
              <Modal.Title id="contained-modal-title-sm"
                style={{
                  textAlign: 'center',
                  color: 'var(--reverse-color)',
                }}>
                {this.state.modalTitle}
                <Glyphicon
                  onClick={() => this.setState({ showModal: false })}
                  glyph={'remove'}
                  style={{
                    color: 'var(--reverse-color)',
                    cursor: 'pointer',
                    fontSize: '18px',
                    float: 'right',
                  }}
                />
              </Modal.Title>
            </Modal.Header>
            <Modal.Body style={{
              height: '550px',
              backgroundColor: 'var(--reverse-color)',
              color: 'var(--accent-color-dark)',
              overflow: 'auto',
            }}>
              {this.state.modalContent}
            </Modal.Body>
          </Modal>
        </div>
      </MuiThemeProvider>
    );
  }
}

CreateLocalAccount.propTypes = {
  translate: PropTypes.func.isRequired,
  setLanguage: PropTypes.func.isRequired,
  setActiveLanguage: PropTypes.func.isRequired,
  actions: PropTypes.shape({
    openOptionDialog: PropTypes.func.isRequired,
    closeAlert: PropTypes.func.isRequired,
  }),
  setView: PropTypes.func.isRequired,
  loginUser: PropTypes.func.isRequired,
  addTranslationForLanguage: PropTypes.func.isRequired,
};

const mapDispatchToProps = { setLanguage };

export default withLocalize(connect(null, mapDispatchToProps)(CreateLocalAccount));
