import React, { Component } from 'react';
import { Checkbox } from 'material-ui';
import { Modal } from 'react-bootstrap';
import TermsAndConditionsPage from './pages/TermsAndConditionsPage';
import StatementOfFaithPage from './pages/StatementOfFaithPage';
import CreativeCommonsPage from './pages/CreativeCommonsPage';

class CreateLocalAccount extends Component {
    constructor(props) {
        super(props);
        this.state = {
            localUsername: "This is publicly visible",
            checkBoxChecked: false,
            showModal: false,
            modalTitle: null,
            modalContent: null
        };
        this.infoPopup = this.infoPopup.bind(this);
        this.typing = this.typing.bind(this);
    }

    typing(e) {
        if (e.target.value == "This is publicly visible") this.setState({ localUsername: "" });
        else this.setState({ localUsername: e.target.value });
    }

    localUsernameInput() {
        return (
            <div>
                <span style={{ color: 'grey' }}>Username</span>
                <br />
                <input
                    onFocus={this.typing}
                    onChange={this.typing}
                    value={this.state.localUsername}
                    style={{
                        color: this.state.localUsername == "This is publicly visible" ? 'grey' : 'black',
                        fontStyle: this.state.localUsername == "This is publicly visible" ? 'italic' : 'normal',
                        border: '1px solid black', outline: 'none', borderRadius: 2,
                        height: 30, width: 250, padding: 5, marginTop: 5
                    }}>
                </input>
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
                <p>You are being chosen to be known as "
                <span style={{ fontWeight: 'bold', color: 'var(--accent-color-dark)' }}>{this.state.localUsername}</span>
                    ". This will be available publicly<br /><br />
                    If you are not comfortable with being known as "
                <span style={{ fontWeight: 'bold', color: 'var(--accent-color-dark)' }}>{this.state.localUsername}</span>
                    ", You may <span style={{ fontWeight: 'bold', color: 'var(--accent-color-dark)' }}>Go Back </span>
                    and enter a new name.
                </p>
            </div>
        )
    }

    loginButtons() {
        const loginEnabled = this.state.checkBoxChecked;
        const callback = (result) => {
            if (result == "Create Account") this.props.actions.loginLocalUser(this.state.localUsername);
            this.props.actions.closeAlert();
        }
        return (
            <div style={{ display: 'flex', width: '100%', justifyContent: 'flex-end' }}>
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
                    onClick={() => this.props.actions.openOptionDialog(this.localUserWarning(), callback, "Create Account", "Go Back")}>
                    Create
                </button>
            </div>
        )
    }

    termsAndConditionsAgreement() {
        return (
            <div style={{ display: 'flex', padding: '30px 0 0 0', alignItems: 'center', width: '100%' }}>
                {this.agreeCheckBox()}
                <span>
                    I have read and agree to the
                    </span>
                &nbsp;
                    <a
                    style={{ cursor: "pointer", textDecoration: "none", }}
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
            <div style={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column', width: '100%' }}>
                <div style={{ fontSize: 25, fontWeight: 100, padding: '20px 0 20px 0' }}>New Local User</div>
                {this.localUsernameInput()}
                {this.termsAndConditionsAgreement()}
                {this.loginButtons()}
                <Modal show={this.state.showModal} onHide={() => this.setState({ showModal: false })} bsSize="lg">
                    <Modal.Header style={{ backgroundColor: "var(--accent-color-dark)" }}>
                        <Modal.Title>
                            {this.state.modalTitle}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body style={{ backgroundColor: "var(--reverse-color)", color: "var(--accent-color-dark)", display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                        {this.state.modalContent}
                    </Modal.Body>
                </Modal>

            </div>
        );
    }
}

export default CreateLocalAccount;