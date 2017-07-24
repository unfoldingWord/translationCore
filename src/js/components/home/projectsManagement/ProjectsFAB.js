import React, { Component } from 'react';
import { FloatingActionButton, Card, CardText } from 'material-ui'
import { Glyphicon } from 'react-bootstrap';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
// components
import FABLabelCard from './FABLabelCard';
import SpotlightComponent from './SpotlightComponent';

class ProjectFAB extends Component {

  render() {
    const { showFABOptions } = this.props.homeScreenReducer;

    const buttonsMetadata = [
      {
        action: () => {this.props.actions.selectLocalProjectToLoad()},
        buttonLabel: "Import Local Project",
        glyph: "folder-open"
      },
      {
        action: () => {this.props.actions.openOnlineImportModal()},
        buttonLabel: "Import Online Project",
        glyph: "cloud-download"
      }
    ];

    return (
      <MuiThemeProvider>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "flex-end", zIndex: "999" }}>
          {showFABOptions ? (
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between"}}>
              <table>
                <tbody>
                  {buttonsMetadata.map((metadata, i) => {
                    return (
                      <tr key={i}>
                        <td>
                          <FABLabelCard label={metadata.buttonLabel} />
                        </td>
                        <td>
                          <FloatingActionButton
                            onClick={() => {metadata.action()}}
                            style={{ margin: "5px", alignSelf: "flex-end", zIndex: "999" }}
                            backgroundColor={"var(--accent-color-dark)"}
                          >
                            <Glyphicon style={{ fontSize: "26px" }} glyph={metadata.glyph} />
                          </FloatingActionButton>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>) : <div></div>
          }
          <table>
            <tbody>
              <tr>
                <td>
                  {showFABOptions ? <FABLabelCard label={"Close"} /> : <div />}
                </td>
                <td>
                  <FloatingActionButton
                    onClick={() => this.props.actions.toggleProjectsFAB()}
                    style={{ margin: "5px", alignSelf: "flex-end", zIndex: "999" }}
                    backgroundColor={showFABOptions ? "var(--reverse-color)" : "var(--accent-color-dark)"}
                  >
                    <Glyphicon
                      style={{ fontSize: "26px", color: showFABOptions ? "var(--accent-color-dark)" : "var(--reverse-color)" }}
                      glyph={showFABOptions ? "remove" : "menu-hamburger"}
                    />
                  </FloatingActionButton>
                </td>
               </tr>
            </tbody>
          </table>
          {showFABOptions ? <SpotlightComponent /> : <div />}
        </div>
      </MuiThemeProvider>
    );
  }
}

export default ProjectFAB;
