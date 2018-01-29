import React, { Component } from 'react';
import PropTypes from 'prop-types';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { TextField, Checkbox } from 'material-ui';
import { Modal, Glyphicon } from 'react-bootstrap';
import TermsAndConditionsPage from './pages/TermsAndConditionsPage';
import StatementOfFaithPage from './pages/StatementOfFaithPage';
import CreativeCommonsPage from './pages/CreativeCommonsPage';

class CreateLocalAccount extends Component {
  constructor(props) {
    super(props);
    this.state = {
      localUsername: "",
      checkBoxChecked: false,
      showModal: false,
      modalTitle: null,
      modalContent: null
    };
    this.infoPopup = this.infoPopup.bind(this);
  }

  componentDidMount(){
    this.focusInputField && this.focusInputField.focus();
  }

  localUsernameInput() {
    const setFocusInputField = (input) => {this.focusInputField = input};
    const {translate} = this.props;
    return (
      <div>
        <TextField
          className="Username"
          value={this.state.localUsername}
          floatingLabelText={translate('username')}
          underlineFocusStyle={{ borderColor: "var(--accent-color-dark)" }}
          floatingLabelStyle={{ color: "var(--text-color-dark)", opacity: "0.3", fontWeight: "500"}}
          onChange={e => this.setState({localUsername: e.target.value})}
          ref={setFocusInputField}
        />
      </div>
    );
  }

  agreeCheckBox() {
    return (
      <Checkbox
        checked={this.state.checkBoxChecked}
        style={{ width: "0px", marginRight: -10 }}
        iconStyle={{ fill: 'black' }}
        labelStyle={{ color: "var(--reverse-color)", opacity: "0.7", fontWeight: "500" }}
        onCheck={() => {
          this.setState({ checkBoxChecked: !this.state.checkBoxChecked });
        }}
      />
    );
  }

  localUserWarning() {
    const {translate} = this.props;
    const {localUsername} = this.state;
    return (
      <div>
        <p style={{ fontSize: 20, fontWeight: 'bold' }}>{translate('attention')}</p>
        {translate('home.users.login.confirm_guest', {name: localUsername})}
      </div>
    );
  }

  loginButtons() {
    const loginEnabled = !!(this.state.localUsername && this.state.checkBoxChecked);
    const {translate} = this.props;
    const continueText = translate('continue');
    const callback = (result) => {
      if (result === continueText) this.props.loginUser({username:this.state.localUsername}, true);
      this.props.actions.closeAlert();
    };
    return (
      <div style={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
        <button
          className="btn-second"
          style={{ width: 150, margin: "40px 10px 0px 0px" }}
          onClick={() => this.props.setView('main')}>
          {translate('go_back')}
        </button>
        <button
          className={loginEnabled ? "btn-prime" : "btn-prime-reverse"}
          disabled={!loginEnabled}
          style={{ width: 200, margin: "40px 0px 0px 10px" }}
          onClick={() => this.props.actions.openOptionDialog(this.localUserWarning(), callback, continueText, translate('cancel'))}>
          {continueText}
        </button>
      </div>
    );
  }

  termsAndConditionsAgreement() {
    // const {translate} = this.props;
    return (
      <div style={{ display: 'flex', justifyContent: "center", alignItems: 'center', width: '100%' }}>
        {this.agreeCheckBox()}
        <span>I have read and agree to the</span>&nbsp;
        <a
          style={{ cursor: "pointer", textDecoration: "none" }}
          onClick={() =>
            this.infoPopup("Terms and Conditions")
          }>
          terms and conditions
        </a>
      </div>
    );
  }

  infoPopup(type) {
    let show = !!type;
    let content;
    let title = <strong>{type}</strong>;
    switch (type) {
      case "Terms and Conditions":
        content = <TermsAndConditionsPage infoPopup={this.infoPopup} />;
        break;
      case "Creative Commons":
        content = <CreativeCommonsPage infoPopup={this.infoPopup} />;
        break;
      case "Statement Of Faith":
        content = <StatementOfFaithPage infoPopup={this.infoPopup} />;
        break;
      default: content = <div />;
        break;
    }
    this.setState({ showModal: show, modalTitle: title, modalContent: content });
  }

  render() {
    const {translate} = this.props;
    return (
      <MuiThemeProvider>
      <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column', width: '100%' }}>
        <div style={{ fontSize: 25, fontWeight: 100, padding: '0px' }}>New Guest</div>
        <span style={{ color: 'grey' }}>{translate('home.users.login.is_publicly_visible')}</span>
        {this.localUsernameInput()}
        {this.termsAndConditionsAgreement()}
        {this.loginButtons()}
        <Modal show={this.state.showModal} onHide={() => this.setState({ showModal: false })} bsSize="lg">
          <Modal.Header style={{ backgroundColor: "var(--accent-color-dark)" }}>
            <Modal.Title id="contained-modal-title-sm"
              style={{ textAlign: "center", color: "var(--reverse-color)" }}>
              {this.state.modalTitle}
              <Glyphicon
                  onClick={() => this.setState({ showModal: false })}
                  glyph={"remove"}
                  style={{color: "var(--reverse-color)", cursor: "pointer", fontSize: "18px", float: "right"}}
              />
            </Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ height: "550px", backgroundColor: "var(--reverse-color)", color: "var(--accent-color-dark)", overflow: "auto" }}>
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
  actions: PropTypes.shape({
      openOptionDialog: PropTypes.func.isRequired,
      closeAlert: PropTypes.func.isRequired
  }),
  setView: PropTypes.func.isRequired,
  loginUser: PropTypes.func.isRequired
};

export default CreateLocalAccount;
