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
    // let { title, version, description, badgeImagePath, folderName, name} = this.props.metadata;
    // let { currentToolName } = this.props;
    const currentToolName = "translationWords";
    return (
      <MuiThemeProvider>
        <Card>
          <img
            style={{ float: "left", height: "90px", margin: "10px" }}
            src={window.__base + `src/images/${currentToolName}Banner.png`}
          />
          <CardHeader
            title={currentToolName}
            titleStyle={{ fontWeight: "bold" }}
            subtitle="Version 1.0.0"
          /><br />
          <ToolCardProgress progress={0.5} /><br />
          <span style={{ fontWeight: "bold", fontSize: "16px", margin: "10px" }}>Description</span>
          
          {this.state.showDescription ? 
            (<p style={{ padding: "10px" }}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Donec mattis pretium massa. Aliquam erat volutpat. Nulla facilisi.
              Donec vulputate interdum sollicitudin. Nunc lacinia auctor quam sed pellentesque.
              Aliquam dui mauris, mattis quis lacus id, pellentesque lobortis odio.
            </p>) : (<div />)
          }
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div
              style={{ padding: "10px", fontSize: "18px", cursor: "pointer" }}
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
              onClick={() => {this.props.actions.handleSelectTool()}}
              style={{ width: '90px', margin: '10px' }}
            >
              Select
            </button>
          </div>
        </Card>
      </MuiThemeProvider>
    );
  }
}
