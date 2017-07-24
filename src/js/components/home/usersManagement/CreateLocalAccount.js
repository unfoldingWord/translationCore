import React, { Component } from 'react';
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

  localUsernameInput() {
    return (
      <div>
         <TextField
          value={this.state.localUsername}
          floatingLabelText="Username"
          underlineFocusStyle={{ borderColor: "var(--accent-color-dark)" }}
          floatingLabelStyle={{ color: "var(--text-color-dark)", opacity: "0.3", fontWeight: "500"}}
          onChange={e => this.setState({localUsername: e.target.value})}
        />
      </div>
    )
  }

  agreeCheckBox() {
    return (
      <Checkbox
        checked={this.state.checkBoxChecked}
        style={{ width: "0px", marginRight: -10 }}
        iconStyle={{ fill: 'black' }}
        labelStyle={{ color: "var(--reverse-color)", opacity: "0.7", fontWeight: "500" }}
        onCheck={(e) => {
          this.setState({ checkBoxChecked: !this.state.checkBoxChecked });
        }}
      />
    )
  }

  localUserWarning() {
    return (
      <div>
        <p style={{ fontSize: 20, fontWeight: 'bold' }}>Attention</p>
        <p>You have chosen to be known as "
                    <span style={{ fontWeight: 'bold', color: 'var(--accent-color-dark)' }}>{this.state.localUsername}</span>
          ". This username will be publicly viewable.
                    <br /><br />
          If you are not comfortable with being known as "
                    <span style={{ fontWeight: 'bold', color: 'var(--accent-color-dark)' }}>{this.state.localUsername}</span>
          ", You may <span style={{ fontWeight: 'bold', color: 'var(--accent-color-dark)' }}>Cancel </span>
          and enter a new name.
                </p>
      </div>
    )
  }

  loginButtons() {
    const loginEnabled = this.state.localUsername && this.state.checkBoxChecked ? true : false;
    const callback = (result) => {
      if (result == "Create Account") this.props.loginLocalUser(this.state.localUsername);
      this.props.actions.closeAlert();
    }
    return (
      <div style={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
        <button
          className="btn-second"
          style={{ width: 150, margin: "40px 10px 0px 0px" }}
          onClick={() => this.props.setView('main')}>
          Go Back
                </button>
        <button
          className={loginEnabled ? "btn-prime" : "btn-prime-reverse"}
          disabled={!loginEnabled}
          style={{ width: 200, margin: "40px 0px 0px 10px" }}
          onClick={() => this.props.actions.openOptionDialog(this.localUserWarning(), callback, "Create Account", "Cancel")}>
          Create
                </button>
      </div>
    )
  }

  termsAndConditionsAgreement() {
    return (
      <div style={{ display: 'flex', justifyContent: "center", alignItems: 'center', width: '100%' }}>
        {this.agreeCheckBox()}
        <span>
          I have read and agree to the
                    </span>
        &nbsp;
                    <a
          style={{ cursor: "pointer", textDecoration: "none" }}
          onClick={() =>
            this.infoPopup("Terms and Conditions")
          }>
          terms and conditions
                    </a>
      </div>
    )
  }

  infoPopup(type) {
    let show = !!type;
    let content;
    let title = <strong>{type}</strong>
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
    this.setState({ showModal: show, modalTitle: title, modalContent: content })
  }

  render() {
    return (
      <MuiThemeProvider>
      <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column', width: '100%' }}>
        <div style={{ fontSize: 25, fontWeight: 100, padding: '0px' }}>New Local User</div>
        <span style={{ color: 'grey' }}>This is publicly visible</span>
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

export default CreateLocalAccount;