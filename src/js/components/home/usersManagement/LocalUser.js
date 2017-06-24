import React, { Component } from 'react';
import { Checkbox } from 'material-ui';
import TermsAndConditionsPage from './pages/TermsAndConditionsPage';
import StatementOfFaithPage from './pages/StatementOfFaithPage';
import CreativeCommonsPage from './pages/CreativeCommonsPage';

class LocalUser extends Component {
    constructor(props) {
        super(props);
        this.state = {
            localUsername: "",
            checkBoxChecked: false,
            infoPage: ""
        };
        this.switchInfoPage = this.switchInfoPage.bind(this);
    }
    switchInfoPage(pageName) {
        this.setState({ infoPage: pageName });
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
        let disabledButton = this.state.checkBoxChecked;
        return (
            <div style={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column' }}>
                <div style={{ fontSize: 25, fontWeight: 100, padding: '20px 0 20px 0' }}>New Local User</div>
                <div>
                    <span style={{ color: 'grey' }}>Username</span>
                    <br />
                    <input
                        onFocus={this.focus}
                        onChange={(e) => this.setState({ localUsername: e.target.value.replace("This is publicly visible", "") })}
                        value={this.state.localUsername || "This is publicly visible"}
                        style={{
                            color: this.state.localUsername ? 'black' : 'grey',
                            fontStyle: this.state.localUsername ? 'normal' : 'italic',
                            border: '1px solid black', outline: 'none', borderRadius: 2,
                            height: 30, width: 250, padding: 5, marginTop: 5
                        }}>
                    </input>
                </div>
                <div style={{ display: 'flex', padding: '30px 0 0 0', alignItems: 'center' }}>
                    <Checkbox
                        disabled={!this.state.localUsername}
                        checked={this.state.checkBoxChecked}
                        style={{ width: "0px", marginRight: -10 }}
                        iconStyle={{ fill: 'black' }}
                        labelStyle={{ color: "var(--reverse-color)", opacity: "0.7", fontWeight: "500" }}
                        onCheck={(e, isInputChecked) => {
                            this.setState({ checkBoxChecked: isInputChecked });
                        }}
                    />
                    <span>
                        I have read and agree to the
                </span>
                    &nbsp;
                <a
                        style={{ cursor: "pointer", textDecoration: "none", }}
                        onClick={() => this.showInfoPage("termsAndConditions")}>
                        terms and conditions
                </a>
                    <button
                        className={!disabledButton ? "btn-prime-reverse" : "btn-prime"}
                        disabled={disabledButton}
                        style={{ width: "100%", margin: "40px 0px 10px" }}
                        onClick={() => this.props.loginUser(this.state)}>
                        Log In
                    </button>
                </div>
            </div>
        );
    }
}

export default LocalUser;