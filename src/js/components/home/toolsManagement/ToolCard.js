import React, { Component } from 'react';
import { Card, CardHeader, CardText } from 'material-ui'
import { Glyphicon } from 'react-bootstrap';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import ToolCardProgress from './ToolCardProgress';

export default class ToolsCard extends Component {
    constructor() {
      super();
      this.state = {
        showDescription: false
      }
    }

  render() {
    let { title, version, description, badgeImagePath, folderName, name} = this.props.metadata;
    let { loggedInUser } = this.props;

    return (
      <MuiThemeProvider>
        <Card style={{ margin: "6px 0px 10px" }}>
          <img
            style={{ float: "left", height: "90px", margin: "10px" }}
            src={badgeImagePath}
          />
          <CardHeader
            title={title}
            titleStyle={{ fontWeight: "bold" }}
            subtitle={version}
          /><br />
          <ToolCardProgress progress={0.5} />
          <span style={{ fontWeight: "bold", fontSize: "16px", margin: "0px 10px 10px" }}>Description</span>
          {this.state.showDescription ? 
            (<p style={{ padding: "10px" }}>
              {description}
            </p>) : (<div />)
          }
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div
              style={{ padding: "10px 10px 0px", fontSize: "18px", cursor: "pointer" }}
              onClick={() => this.setState({ showDescription: !this.state.showDescription})}
            >
              <span>{this.state.showDescription ? "See less" : "See more"}</span>
              <Glyphicon
                style={{ fontSize: "18px", margin: "0px 0px 0px 6px" }}
                glyph={this.state.showDescription ? "chevron-up" : "chevron-down"}
              />
            </div>
            <button
              className='btn-prime'
              onClick={() => {this.props.actions.launchTool(folderName, loggedInUser, name)}}
              style={{ width: '90px', margin: '10px' }}
            >
              Launch
            </button>
          </div>
        </Card>
      </MuiThemeProvider>
    );
  }
}
