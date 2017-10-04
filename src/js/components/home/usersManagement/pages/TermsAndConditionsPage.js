import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {Glyphicon} from 'react-bootstrap';

class TermsAndConditionsPage extends Component {
  render() {
    return (
      <div>
        <button
          className="btn-second"
          onClick={() => this.props.infoPopup(null)}>
          <Glyphicon glyph="share-alt" style={{transform: "scaleX(-1)"}} />&nbsp;
          Go Back
        </button>
        <div style={{color: "black", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center"}}>
          <h4 style={{marginTop: "40px"}}><b>Terms and Conditions</b></h4>
          <div>
            <p style={{padding: "15px"}}>
              By continuing, you affirm that you have read and understand the terms and conditions and agree to:
            </p>
            <ul style={{marginLeft: "50px", padding: "10px"}}>
              <li>
                Only add content that does not infringe on someone else&apos;s copyright.
              </li><br />
              <li>
                Only add content that does not conflict with the&nbsp;
                <span
                  onClick={() => this.props.infoPopup("Statement Of Faith")}
                  style={{cursor: "pointer", textDecoration: "underline"}}>
                  Statement of Faith.
                </span>
              </li><br />
              <li>
                Release your contributions to the content under a&nbsp;
                <span
                  onClick={() => this.props.infoPopup("Creative Commons", this.props.CreativeCommonsPage)}
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

TermsAndConditionsPage.propTypes = {
    CreativeCommonsPage: PropTypes.any,
    infoPopup: PropTypes.func.isRequired
};

export default TermsAndConditionsPage;
