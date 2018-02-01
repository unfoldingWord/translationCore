import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FloatingActionButton, Card } from 'material-ui';
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
        action: () => {this.props.actions.selectLocalProject()},
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
                          <FABLabelCard
                            action={() => {metadata.action()}}
                            label={metadata.buttonLabel}
                          />
                        </td>
                        <td>
                          <div style={{ display: "flex", alignSelf: "flex-start" }}>
                            <Card
                              onClick={() => { metadata.action() }}
                              style={{
                                display: "flex",
                                justifyContent: "center",
                                alignSelf: "flex-start",
                                alignItems: "center",
                                cursor: "pointer",
                                height:60,
                                width:60,
                                borderRadius:'50%',
                                margin:5,
                                backgroundColor:"var(--accent-color-dark)"}}
                              containerStyle={{ padding: "0px" }}
                            >
                              <Glyphicon style={{ fontSize: "26px", color:'white' }} glyph={metadata.glyph} />
                            </Card>
                          </div>
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
                  {showFABOptions ? <FABLabelCard label={"Close"} action={() => this.props.actions.toggleProjectsFAB()} /> : <div />}
                </td>
                <td>
                  <div style={{ display: "flex", alignSelf: "flex-start" }}>
                    <Card
                      onClick={() => this.props.actions.toggleProjectsFAB()}
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignSelf: "flex-start",
                        alignItems: "center",
                        cursor: "pointer",
                        height: 60,
                        width: 60,
                        borderRadius: '50%',
                        margin: 5,
                        backgroundColor: showFABOptions ? "var(--reverse-color)" : "var(--accent-color-dark)"
                      }}
                      containerStyle={{ padding: "0px" }}
                      >
                    <Glyphicon
                      style={{ fontSize: "26px", color: showFABOptions ? "var(--accent-color-dark)" : "var(--reverse-color)" }}
                      glyph={showFABOptions ? "remove" : "menu-hamburger"}
                    />
                  </Card>
                  </div>
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

ProjectFAB.propTypes = {
    homeScreenReducer: PropTypes.any.isRequired,
    actions: PropTypes.shape({
        selectLocalProject: PropTypes.func.isRequired,
        openOnlineImportModal: PropTypes.func.isRequired,
        toggleProjectsFAB: PropTypes.func.isRequired
    })
};

export default ProjectFAB;
