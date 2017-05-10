import React, { Component } from 'react';

class TermsAndConditionsPage extends Component {
  render() {
    return (
      <div style={{color: "var(--reverse-color)", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center"}}>
        <h4 style={{marginTop: "40px"}}>Terms and Conditions</h4>
        <div>
          <p style={{padding: "15px", opacity: "0.8"}}>
            By creating a Door43 account you affirm that you have read
            and understand the terms and conditions and agree to:
          </p>
          <ul style={{marginLeft: "50px", padding: "10px", opacity: "0.8"}}>
            <li>
              Only add content to Door43 that does not infringe on someone else's copyright.
            </li><br />
            <li>
              Only add content to Door43 that does not conflict with the&nbsp;
              <span style={{cursor: "pointer", textDecoration: "underline"}}>
                Statement of Faith.
              </span>
            </li><br />
            <li>
              Release your contributions to the content on Door43's website under a&nbsp;
              <span style={{cursor: "pointer", textDecoration: "underline"}}>
                Creative Commons Attribution-ShareAlike 4.0 International License.
              </span>
            </li>
          </ul>
        </div><br /><br />
        <button
          className="btn-second"
          onClick={() => this.props.showLocalUserScreen(false)}>
          Go Back
        </button>
      </div>
    );
  }
}

export default TermsAndConditionsPage;
