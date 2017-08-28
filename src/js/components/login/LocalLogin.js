import React, { Component } from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import {TextField, Checkbox} from 'material-ui';
import TermsAndConditionsPage from './pages/TermsAndConditionsPage';
import StatementOfFaithPage from './pages/StatementOfFaithPage';
import CreativeCommonsPage from './pages/CreativeCommonsPage';

class LocalLogin extends Component {
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
    this.setState({infoPage: pageName});
  }

  render() {
    let {loggedInUser, userdata, loginUser} = this.props;
    let disabledButton = this.state.localUsername && this.state.checkBoxChecked ? false : true;
    let infoPage = <div />

    switch (this.state.infoPage) {
      case "termsAndConditions":
        infoPage = <TermsAndConditionsPage switchInfoPage={this.switchInfoPage} />
        break;
      case "statementOfFaith":
        infoPage = <StatementOfFaithPage switchInfoPage={this.switchInfoPage} />;
        break;
      case "creativeCommons":
        infoPage = <CreativeCommonsPage switchInfoPage={this.switchInfoPage} />;
        break;
      default:
        infoPage = "";
        break;
    }
    return (
      <div>
        {infoPage ?
          infoPage
          :
          (<MuiThemeProvider>
            <div style={{color: "var(--reverse-color)", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center"}}>
              <h4 style={{marginTop: "80px"}}><b>Create Local User</b></h4>
              <p style={{padding: "15px", opacity: "0.7"}}>
                Your username will be publicly available, so make sure that you
                choose a username you are comfortable with sharing.
              </p>
              <TextField
                value={this.state.localUsername}
                floatingLabelText="Username"
                inputStyle={{color: "var(--reverse-color)"}}
                underlineFocusStyle={{ borderColor: "var(--reverse-color)" }}
                floatingLabelStyle={{ color: "var(--reverse-color)", opacity: "0.5", fontWeight: "500"}}
                onChange={e => this.setState({localUsername: e.target.value})}
              /><br /><br />
              <div style={{display: "flex", marginBottom: "80px"}}>
                <Checkbox
                  label=""
                  disabled={!this.state.localUsername}
                  checked={this.state.checkBoxChecked}
                  style={{width: "0px"}}
                  iconStyle={{fill: 'white'}}
                  labelStyle={{color: "black", opacity: "0.7", fontWeight: "500"}}
                  onCheck={(e, isInputChecked) => {
                    this.setState({checkBoxChecked: isInputChecked});
                  }}
                />
                <span>
                  I have read and agree to the
                </span>
                &nbsp;
                <span
                  style={{cursor: "pointer", textDecoration: "underline"}}
                  onClick={() => this.switchInfoPage("termsAndConditions")}>
                  terms and conditions
                </span>
              </div>
              <button
                className={disabledButton ? "btn-second-reverse" : "btn-second"}
                disabled={disabledButton}
                onClick={() => loginUser({username:this.state.localUsername}, true)}>
                  Create
              </button>
            </div>
          </MuiThemeProvider>)
        }
      </div>
    );
  }
}

export default LocalLogin;
