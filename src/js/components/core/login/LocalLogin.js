import React, { Component } from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import {TextField, Checkbox} from 'material-ui';
import TermsAndConditionsPage from './TermsAndConditionsPage';

class LocalLogin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showTermsAndConds: false,
      checkBoxChecked: false
    };
    this.showLocalUserScreen = this.showLocalUserScreen.bind(this);
  }

  showLocalUserScreen(option) {
    this.setState({showTermsAndConds: option})
  }

  render() {
    let {showTermsAndConds} = this.state;
    let disabledButton = this.props.userdata.username && this.state.checkBoxChecked ? false : true;
    return (
      <div>
        {showTermsAndConds ?
          (<TermsAndConditionsPage showLocalUserScreen={this.showLocalUserScreen} />)
          :
          (<MuiThemeProvider>
            <div style={{color: "var(--reverse-color)", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center"}}>
              <h4 style={{marginTop: "80px"}}><b>Create Local User</b></h4>
              <p style={{padding: "15px", opacity: "0.7"}}>
                Your username will be publicly available, so make sure that you
                choose a username you are comfortable with sharing.
              </p>
              <TextField
                floatingLabelText="Username"
                inputStyle={{color: "var(--reverse-color)"}}
                underlineFocusStyle={{ borderColor: "var(--reverse-color)" }}
                floatingLabelStyle={{ color: "var(--reverse-color)", opacity: "0.5", fontWeight: "500"}}
                onChange={this.props.onHandleUserName}
              /><br /><br />
              <div style={{display: "flex", marginBottom: "80px"}}>
                <Checkbox
                  label=""
                  disabled={!this.props.userdata.username}
                  checked={this.state.checkBoxChecked}
                  style={{width: "0px"}}
                  iconStyle={{fill: 'white'}}
                  labelStyle={{color: "var(--reverse-color)", opacity: "0.7", fontWeight: "500"}}
                  onCheck={(e, isInputChecked) => {
                    this.setState({checkBoxChecked: isInputChecked})
                  }}
                />
                <span>
                  I have read and agree to the
                </span>
                &nbsp;
                <span
                  style={{cursor: "pointer", textDecoration: "underline"}}
                  onClick={() => this.showLocalUserScreen(true)}>
                  terms and conditions
                </span>
              </div>
              <button
                className="btn-second-reverse"
                disabled={disabledButton}
                onClick={() => this.props.loginLocalUser()}>
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
