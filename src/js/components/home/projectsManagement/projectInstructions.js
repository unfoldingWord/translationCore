import React, { Component } from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { FloatingActionButton } from 'material-ui'
import { Glyphicon } from 'react-bootstrap';

export default class ProjectInstructions extends Component {
  render() {
    return (
      <MuiThemeProvider>
        <div>
          <p>Select a project from the list.</p>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <p style={{ margin: 0 }}>To import a project, click </p>

            <FloatingActionButton
              disabled={true}
              disabledColor={"var(--accent-color-dark)"}
              mini={true}
              style={{ margin: "5px", alignSelf: "flex-end", zIndex: "999" }}
            >
              <Glyphicon
                style={{ fontSize: "18px", color: "var(--reverse-color)" }}
                glyph={"menu-hamburger"}
              />
            </FloatingActionButton>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <p style={{ margin: 0 }}>To upload or export a project click </p>
            <div
              style={{ margin: "2px 5px 5px 5px", zIndex: "999", height:35, width:35, display:'flex' }}
            >
              <Glyphicon glyph="option-vertical" style={{ fontSize: "large", color:'black', margin:'auto' }} />
            </div>
          </div>
          <p>USFM projects and translationStudio projects (saved in version 11 or greater) are supported.</p>
        </div>
      </MuiThemeProvider>
    );
  }
}
