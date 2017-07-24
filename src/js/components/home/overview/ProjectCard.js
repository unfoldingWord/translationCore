// external
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import path from 'path-extra';
import moment from 'moment';
import fs from 'fs-extra';
import { Glyphicon } from 'react-bootstrap';
// components
import TemplateCard from '../TemplateCard';

class ProjectCard extends Component {

  /**
  * @description generates the heading for the component
  * @param {function} callback - action for link
  * @return {component} - component returned
  */
  heading(callback) {
    const link = this.content() ? <a onClick={callback}>Change Project</a> : <a></a>;
    return (
      <span>Current Project {link}</span>
    );
  }

  /**
  * @description generates a detail for the contentDetails
  * @param {string} glyph - name of the glyph to be used
  * @param {string} text - text used for the detail
  * @return {component} - component returned
  */
  detail(glyph, text) {
    return (
      <div>
        <Glyphicon glyph={glyph} style={{ marginRight: '5px', top: '2px' }} />
        <span>{text}</span>
      </div>
    );
  }

  /**
  * @description generates the details for the content
  * @param {string} projectSaveLocation - path of the project
  * @param {string} text - text used for the detail
  * @return {component} - component returned
  */
  contentDetails(projectSaveLocation, bookName, params, manifest) {
    const projectName = path.basename(projectSaveLocation);
    const projectDataLocation = path.join(projectSaveLocation, '.apps', 'translationCore');
    let accessTime;
    let accessTimeAgo;
    if (fs.existsSync(projectDataLocation)) {
      accessTime = fs.statSync(projectDataLocation).atime;
      accessTimeAgo = moment().to(accessTime);
    } else {
      accessTime = "";
      accessTimeAgo = "Never Opened"
    }

    const { bookAbbr } = params;
    const { target_language } = manifest;
    return (
      <div style={{ display: 'flex' }}>
        <div style={{ width: '100px', height: '110px', color: 'lightgray', margin: '-6px 20px 0 -16px', overflow: 'hidden'}}>
          <Glyphicon glyph="folder-open" style={{ fontSize: "120px", margin: '-10px 0 0 -51px'}} />
        </div>
        <div>
          <strong style={{ fontSize: 'x-large' }}>{projectName}</strong>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '410px', marginTop: '18px' }}>
            {this.detail('time', accessTimeAgo)}
            {this.detail('book', bookName + ' (' + bookAbbr + ')')}
            {this.detail('globe', target_language.name + ' (' + target_language.id + ')')}
          </div>
        </div>
      </div>
    );
  }

  /**
  * @description generates the content for the component, conditionally empty
  * @return {component} - component returned
  */
  content() {
    let content; // content can be empty to fallback to empty button/message
    const { projectDetailsReducer } = this.props.reducers;
    const { projectSaveLocation, bookName, params, manifest } = projectDetailsReducer;
    if (projectSaveLocation && params && manifest.target_language) {
      content = (
        <div style={{ display: 'flex', justifyContent: 'space-between', margin: '-10px 0 -24px 0' }}>
          {this.contentDetails(projectSaveLocation, bookName, params, manifest)}
          <div style={{ marginRight: '-5px' }}>
            <Glyphicon glyph="option-vertical" style={{ fontSize: "large" }} />
          </div>
        </div>
      );
    }
    return content;
  }

  /**
  * @description determines if fallback should be disabled
  * @return {bool} - return true/false
  */
  disabled() {
    const { loggedInUser } = this.props.reducers.loginReducer;
    return !loggedInUser;
  }

  render() {
    const emptyMessage = 'Select a project';
    const emptyButtonLabel = 'Project';
    const emptyButtonOnClick = () => { this.props.actions.goToStep(2) };
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
};

export default ProjectCard;
