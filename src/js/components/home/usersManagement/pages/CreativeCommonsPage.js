import React, { Component } from 'react';
import {Glyphicon} from 'react-bootstrap';

class CreativeCommonsPage extends Component {
  render() {
    return (
      <div>
        <button
          className="btn-second"
          onClick={() => this.props.switchInfoPage("termsAndConditions")}>
          <Glyphicon glyph="share-alt" style={{transform: "scaleX(-1)"}} />&nbsp;
          Go Back
        </button>
        <div style={{color: "var(--reverse-color)", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center"}}>
          <h4><b>Creative Commons Attribution-ShareAlike 4.0 License</b></h4>
          <p style={{padding: "15px"}}>
            This is a human-readable summary of (and not a substitute for) the&nbsp;
            <a style={{color: "var(--reverse-color)",cursor: "pointer", textDecoration: "underline"}}
              href="https://creativecommons.org/licenses/by-sa/4.0/legalcode">
              license
            </a>
          </p>
          <h4><b>You are free to:</b></h4>
          <p>
            <b>Share</b> — copy and redistribute the material in any medium or format.
          </p>
          <p>
            <b>Adapt</b> — remix, transform, and build upon the material&nbsp;
            for any purpose, even commercially.
            This license is acceptable for Free Cultural Works.
          </p>
          <p>
            <i>The licensor cannot revoke these freedoms as long as you follow the license terms.</i>
          </p>
          <h4><b>Under the following terms:</b></h4>
          <p>
            <b>Attribution</b> —  You must attribute the work as follows: "Original work available&nbsp;
            at https://git.door43.org/." Attribution statements in derivative works should not in any way&nbsp;
            suggest that we endorse you or your use of this work
          </p>
          <p>
            <b>ShareAlike</b> — If you remix, transform, or build upon the material, you must&nbsp;
            distribute your contributions under the same license as the original.
          </p>
          <p>
            <b>No additional restrictions</b> — You may not apply legal terms or technological&nbsp;
            measures that legally restrict others from doing anything the license permits.
          </p>
          <h4><b>Notices:</b></h4>
          <p>
            You do not have to comply with the license for elements of the material in the&nbsp;
            public domain or where your use is permitted by an applicable exception or limitation.
          </p>
          <p>
            No warranties are given. The license may not give you all of the permissions&nbsp;
            necessary for your intended use. For example, other rights such as publicity,&nbsp;
            privacy, or moral rights may limit how you use the material.
          </p>
        </div>
      </div>
    );
  }
}

export default CreativeCommonsPage;
