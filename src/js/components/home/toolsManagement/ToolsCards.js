import React, { Component } from 'react';
// components
import ToolCard from './ToolCard';
import { Card, CardText } from 'material-ui'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

class ToolsCards extends Component {
  render() {
    const { toolsMetadata, bookName, projectSaveLocation, loggedInUser } = this.props;

    if (toolsMetadata.length == 0 ) {
      return (
        <MuiThemeProvider>
          <Card style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "6px 0px 10px", height: "200px" }}>
            <CardText style={{ fontWeight: "bold" }}>
              No tC default tools found.
            </CardText>
          </Card>
        </MuiThemeProvider>
      );
    } else if (bookName.length == 0 && projectSaveLocation == 0) {
      return (
        <MuiThemeProvider>
          <Card style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "6px 0px 10px", height: "200px" }}>
            <CardText style={{ fontWeight: "bold" }}>
              No project was selected. Please
              <span
                style={{ color: "var(--accent-color-dark)", cursor: "pointer" }}
                onClick={() => this.props.actions.goToStep(2)}
              >
                &nbsp;select a project&nbsp;
              </span>first.
            </CardText>
          </Card>
        </MuiThemeProvider>
      );
    } else {
      return (
        <div style={{ height: '100%', overflowY: 'auto' }}>
          {
            toolsMetadata.map((metadata, i) => {
              return (
                <ToolCard
                  key={i}
                  actions={this.props.actions}
                  loggedInUser={loggedInUser}
                  metadata={metadata}
                />
              );
            })
          }
        </div>
      );
    }
  }
}

export default ToolsCards;
