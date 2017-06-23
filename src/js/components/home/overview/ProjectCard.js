import React, { Component } from 'react';
import PropTypes from 'prop-types';
import path from 'path-extra';
import moment from 'moment';
import fs from 'fs-extra';
import { Glyphicon } from 'react-bootstrap';
import TemplateCard from './TemplateCard';

class ProjectCard extends Component {

  heading(callback) {
    let link = this.content() ? <a onClick={callback}>Change Project</a> : <a></a>;
    return (
      <span>Current Project {link}</span>
    );
  }

  content() {
    let content;
    let { projectDetailsReducer } = this.props.reducers;
    let { projectSaveLocation, bookName, params, manifest } = projectDetailsReducer;
    let projectName, accessTimeAgo;
    if (projectSaveLocation) {
      projectName = projectSaveLocation.split("/").pop();
      let projectDataLocation = path.join(projectSaveLocation, '.apps', 'translationCore');
      let accessTime = fs.statSync(projectDataLocation).atime;
      accessTimeAgo = moment().to(accessTime);
    }
    if (projectName && params && manifest.target_language) {
      let { bookAbbr } = params;
      let { target_language } = manifest;
      content = (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '-10px' }}>
          <div style={{ display: 'flex' }}>
            <div style={{ width: '100px', height: '110px', color: 'lightgray', margin: '-6px 20px 0 -16px', overflow: 'hidden'}}>
              <Glyphicon glyph="folder-open" style={{ fontSize: "120px", margin: '-10px 0 0 -51px'}} />
            </div>
            <div>
              <strong style={{ fontSize: 'x-large' }}>{projectName}</strong>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '410px', marginTop: '18px' }}>
                <div>
                  <Glyphicon glyph="time" style={{ marginRight: '5px', top: '2px' }} />
                  <span>{accessTimeAgo}</span>
                </div>
                <div>
                  <Glyphicon glyph="book" style={{ marginRight: '5px', top: '2px' }} />
                  <span>{bookName} ({bookAbbr})</span>
                </div>
                <div>
                  <Glyphicon glyph="globe" style={{ marginRight: '5px', top: '2px' }} />
                  <span>{target_language.name} ({target_language.id})</span>
                </div>
              </div>
            </div>
          </div>
          <div style={{ marginRight: '-5px' }}>
            <Glyphicon glyph="option-vertical" style={{ fontSize: "large" }} />
          </div>
        </div>
      );
    }
    return content;
  }

  disabled() {
    let { loggedInUser } = this.props.reducers.loginReducer;
    return !loggedInUser;
  }

  render() {
    let emptyMessage = 'Select a project';
    let emptyButtonLabel = 'Project';
    let emptyButtonOnClick = () => { this.props.actions.goToNextStep() };
    return (
      <TemplateCard
        heading={this.heading(emptyButtonOnClick)}
        content={this.content()}
        emptyMessage={emptyMessage}
        emptyButtonLabel={emptyButtonLabel}
        emptyButtonOnClick={emptyButtonOnClick}
        disabled={this.disabled()}
      />
    )
  }
}

ProjectCard.propTypes = {
  reducers: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired
}

export default ProjectCard
