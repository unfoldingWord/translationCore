import React, { Component } from 'react';
import PropTypes from 'prop-types';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
// components
import { Card, CardHeader } from 'material-ui';
import { Glyphicon } from 'react-bootstrap';
import ToolCardProgress from './ToolCardProgress';
import GlDropDownList from './GlDropDownList.js';

export default class ToolsCard extends Component {
  constructor() {
    super();
    this.state = {
      showDescription: false,
      selectedGL: 'English'
    };

  }

  componentWillMount() {
    this.props.actions.getProjectProgressForTools(this.props.metadata.name);
  }

  render() {
    let { title, version, description, badgeImagePath, folderName, name } = this.props.metadata;
    let { loggedInUser, currentProjectToolsProgress } = this.props;
    let progress = currentProjectToolsProgress[name] ? currentProjectToolsProgress[name] : 0;
    let isEnabled = GlDropDownList.value > 0 ;
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
          <ToolCardProgress progress={progress} />
          {this.state.showDescription ? 
            (<div>
              <span style={{ fontWeight: "bold", fontSize: "16px", margin: "0px 10px 10px" }}>Description</span>
              <p style={{ padding: "10px" }}>
              {description}
              </p>
            </div>) : (<div />)
          }
          <div style={{ display: "flex", justifyContent: "space-between", flexDirection: "row" }}>
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
            </div>         
            <GlDropDownList />
            <button
              disabled={!isEnabled}        
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

ToolsCard.propTypes = {
  actions: PropTypes.object.isRequired,
  loggedInUser: PropTypes.bool.isRequired,
  currentProjectToolsProgress: PropTypes.object.isRequired,
  metadata: PropTypes.object.isRequired
};
