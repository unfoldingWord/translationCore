import React, { Component } from 'react';
import { Checkbox } from 'material-ui';
import TermsAndConditionsPage from './pages/TermsAndConditionsPage';
import StatementOfFaithPage from './pages/StatementOfFaithPage';
import CreativeCommonsPage from './pages/CreativeCommonsPage';

class CreateLocalAccount extends Component {
    constructor(props) {
        super(props);
        this.state = {
            localUsername: "This is publicly visible",
            checkBoxChecked: false,
            infoPage: ""
        };
        this.typing = this.typing.bind(this);
        this.switchInfoPage = this.switchInfoPage.bind(this);
    }
    switchInfoPage(pageName) {
        
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

    loginButton() {
        const loginEnabled = this.state.checkBoxChecked;
        return (
            <button
                className={loginEnabled ? "btn-prime" : "btn-prime-reverse"}
                disabled={!loginEnabled}
                style={{ width: "100%", margin: "40px 0px 10px" }}
                onClick={() => this.props.actions.loginLocalUser(this.state.localUsername)}>
                Log In
           </button>
        )
    }

    termsAndConditionsAgreement() {
        return (
            <div style={{ display: 'flex', padding: '30px 0 0 0', alignItems: 'center' }}>
                {this.agreeCheckBox()}
                <span>
                    I have read and agree to the
                    </span>
                &nbsp;
                    <a
                    style={{ cursor: "pointer", textDecoration: "none", }}
                    onClick={() => this.showInfoPage("termsAndConditions")}>
                    terms and conditions
                    </a>
            </div>
        )
    }

    render() {
        let infoPageView = <div />
        switch (this.state.infoPage) {
            case "termsAndConditions":
                infoPageView = <TermsAndConditionsPage switchInfoPage={this.switchInfoPage} />
                break;
            case "statementOfFaith":
                infoPageView = <StatementOfFaithPage switchInfoPage={this.switchInfoPage} />;
                break;
            case "creativeCommons":
                infoPageView = <CreativeCommonsPage switchInfoPage={this.switchInfoPage} />;
                break;
            default:
                break;
        }
        return (
            <div style={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column' }}>
                <div style={{ fontSize: 25, fontWeight: 100, padding: '20px 0 20px 0' }}>New Local User</div>
                {this.localUsernameInput()}
                {this.termsAndConditionsAgreement()}
                {this.loginButton()}
            </div>
        );
    }
}

export default CreateLocalAccount;