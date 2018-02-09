import React, { Component } from 'react';
import PropTypes from 'prop-types';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Hint from '../../Hint';

// components
import { Card, CardHeader } from 'material-ui';
import { Glyphicon } from 'react-bootstrap';
import ToolCardProgress from './ToolCardProgress';
import GlDropDownList from './GlDropDownList.js';

const GLDEFAULT = 1; // English

export default class ToolsCard extends Component {
  constructor() {
    super();
    this.state = {
      showDescription: false,
      selectedGL: 'English',
      currentGLSelection: GLDEFAULT 
    };
    this.selectionChange = this.selectionChange.bind(this);
  }

  selectionChange(currentGLSelection){ 
    const {translate} = this.props;
    this.setState({currentGLSelection});
    
    if( currentGLSelection == 0) {
      this.setState({
        GLhint: translate('home.tools.gl_select')
      });
    } else {
      this.setState({
        GLhint: translate('home.tools.only_english')
      });
    }
  }

  componentWillMount() {
    this.props.actions.getProjectProgressForTools(this.props.metadata.name);
  }

  render() {
    let { title, version, description, badgeImagePath, folderName, name } = this.props.metadata;
    let { loggedInUser, currentProjectToolsProgress, translate } = this.props;
    let progress = currentProjectToolsProgress[name] ? currentProjectToolsProgress[name] : 0;
    let isEnabled = this.state.currentGLSelection == GLDEFAULT ;

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
              <span style={{ fontWeight: "bold", fontSize: "16px", margin: "0px 10px 10px" }}>{translate('description')}</span>
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
                <span>{this.state.showDescription ? translate('see_less') : translate('see_more')}</span>
                <Glyphicon
                  style={{ fontSize: "18px", margin: "0px 0px 0px 6px" }}
                  glyph={this.state.showDescription ? "chevron-up" : "chevron-down"}
                />
              </div>
            </div>         
            <GlDropDownList 
              currentGLSelection={this.state.currentGLSelection}
              selectionChange={this.selectionChange}
            />
            <Hint 
                position={'left'} 
                size='medium' 
                label={this.state.GLhint} 
                enabled={!isEnabled}
            >
              <button
                disabled={!isEnabled}        
                className='btn-prime'
                onClick={() => {this.props.actions.launchTool(folderName, loggedInUser, name)}}
                style={{ width: '90px', margin: '10px' }}
              >
                Launch
              </button>
            </Hint>
          </div>
        </Card>
      </MuiThemeProvider>
    );
  }
}

ToolsCard.propTypes = {
  translate: PropTypes.func.isRequired,
  actions: PropTypes.object.isRequired,
  loggedInUser: PropTypes.bool.isRequired,
  currentProjectToolsProgress: PropTypes.object.isRequired,
  metadata: PropTypes.object.isRequired
};
