import React, { Component } from 'react';
import PropTypes from 'prop-types';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
// components
import { Card, CardHeader } from 'material-ui';
import { Glyphicon } from 'react-bootstrap';
import ToolCardProgress from './ToolCardProgress';

export default class ToolsCard extends Component {
  constructor() {
    super();
    this.state = {
      showDescription: false,
      selectedGL: 'Select Gateway Language',
      value: 10
    };
  }

  componentWillMount() {
    this.props.actions.getProjectProgressForTools(this.props.metadata.name);
  }
  
  //handleChange = (event, index, value) => {
  //  this.setState({value});
  //}

  render() {
    let { title, version, description, badgeImagePath, folderName, name } = this.props.metadata;
    let { loggedInUser, currentProjectToolsProgress } = this.props;
    let progress = currentProjectToolsProgress[name] ? currentProjectToolsProgress[name] : 0;
    let GLs = [];
    const GLitems =  ["Select Gateway Lanugage", "Chinese", "English", "Hindi", "French", "Portugese", "Spanish", "Telugu"]; 
    for( let i = 0; i < GLitems.length; i++ ) {
      GLs.push(<MenuItem value={GLitems[i]} key={i} primaryText={'Item ${GLitems[i]}'} />);
    } 
  
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
          <SelectField 
            value={this.state.value}
            /* onChange={this.handleChange} */
            maxHeight={10}
          >
            {GLs}
          </SelectField>
          <button
            className='btn-prime'
            onClick={() => {this.props.actions.launchTool(folderName, loggedInUser, name)}}
            style={{ width: '90px', margin: '10px' }}
          >
            Launch
          </button>
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
