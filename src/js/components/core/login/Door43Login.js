import React from 'react';
import { shell } from 'electron';
import Registration from './Registration.js';
import { Glyphicon, Col} from 'react-bootstrap';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import TextField from 'material-ui/TextField';

class Door43Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: null,
      password: null
    };
  }

  render() {
    let { displayLogin, showPopover } = this.props;
    let u = this.state.username
    let p = this.state.password
    let disabledButton = (u == null || u == "") || (p == null || p == "")
    if (!displayLogin) {
      return (
        <Col md={12} sm={12} xs={12} style={{ marginTop: "50px" }}>
          <center>
            <Registration back={() => this.props.onSwitchToLoginPage(!displayLogin)} />
          </center>
        </Col>
      );
    } else {
      return (
        <MuiThemeProvider>
          <div style={{display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center"}}>
            <img src="images/D43_LOGO.png" style={{margin: "30px 0px 0px"}} /><br/>
            <h4>
              <b>{"Log in with Door43"}</b>&nbsp;
              <Glyphicon
                glyph="info-sign"
                style={{fontSize: "20px"}}
                onClick={
                  (e) => {
                    let positionCoord = e.target;
                    let title = <strong>Door43 Information</strong>
                    let text = <div style={{ padding: "0 20px" }}>
                      <p>
                        Door43 is a free, online, revision-controlled content management
                        <br/>system for open-licensed biblical material.
                      </p>
                      <p>
                        It provides free, remote storage and collaboration services
                        <br/>for creators and translators of biblical content.
                      </p>
                    </div>;
                    showPopover(title, text, positionCoord);
                  }
                }
              />
            </h4>
            <TextField
              floatingLabelText="Username"
              underlineFocusStyle={{ borderColor: "var(--accent-color-dark)" }}
              floatingLabelStyle={{ color: "var(--text-color-dark)", opacity: "0.3", fontWeight: "500"}}
              onChange={e => this.setState({username: e.target.value})}
            />
            <TextField
              floatingLabelText="Password"
              type="password"
              underlineFocusStyle={{ borderColor: "var(--accent-color-dark)" }}
              floatingLabelStyle={{ color: "var(--text-color-dark)", opacity: "0.3", fontWeight: "500"}}
              onChange={e => this.setState({password: e.target.value})}
            />
            <button
              className={disabledButton ? "btn-prime-reverse" : "btn-prime"}
              disabled={disabledButton}
              style={{width: "100%", margin: "40px 0px 20px"}}
              onClick={() => this.props.handleSubmit(this.state)}>
              Log In
            </button>
            <button
              className="btn-second"
              style={{width: "100%", margin: "20px 0px 20px"}}
              onClick={() => shell.openExternal('https://git.door43.org/user/sign_up')}>
                Create Door43 Account
            </button>
          </div>
        </MuiThemeProvider>
      );
    }
  }
}

export default Door43Login;
