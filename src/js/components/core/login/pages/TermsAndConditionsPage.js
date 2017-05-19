import React, { Component } from 'react';
import {Glyphicon} from 'react-bootstrap';

class TermsAndConditionsPage extends Component {
  render() {
    return (
      <div>
        <button
          className="btn-second"
          onClick={() => this.props.switchInfoPage("")}>
          <Glyphicon glyph="share-alt" style={{transform: "scaleX(-1)"}} />&nbsp;
          Go Back
        </button>
        <div style={{color: "var(--reverse-color)", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center"}}>
          <h4 style={{marginTop: "40px"}}><b>Terms and Conditions</b></h4>
          <div>
            <p style={{padding: "15px"}}>
              By creating a Door43 account, you affirm that you have read
              and understand the terms and conditions and agree to:
            </p>
            <ul style={{marginLeft: "50px", padding: "10px"}}>
              <li>
                Only add content to Door43 that does not infringe on someone else's copyright.
              </li><br />
              <li>
                Only add content to Door43 that does not conflict with the&nbsp;
                <span
                  onClick={() => this.props.switchInfoPage("statementOfFaith")}
                  style={{cursor: "pointer", textDecoration: "underline"}}>
                  Statement of Faith.
                </span>
              </li><br />
              <li>
                Release your contributions to the content on Door43's website under a&nbsp;
                <span
                  onClick={() => this.props.switchInfoPage("creativeCommons")}
                  style={{cursor: "pointer", textDecoration: "underline"}}>
                  Creative Commons Attribution-ShareAlike 4.0 International License.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
}

export default TermsAndConditionsPage;
