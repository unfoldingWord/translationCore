import React, { Component } from 'react'
import TemplateCard from './TemplateCard'

class ProjectCard extends Component {

  heading(callback) {
    let link = this.content() ? <a onClick={callback}>Change Project</a> : <a></a>
    return (
      <span>Current Project {link}</span>
    );
  }

  content() {
    let content;
    let { projectSaveLocation } = this.props.reducers.projectDetailsReducer;
    let projectName;
    if (projectSaveLocation) {
      projectName = projectSaveLocation.split("/").pop();
    }
    if (projectName) {
      content = (
        <div>
          <strong>{projectName}</strong>
          <p>details</p>
        </div>
      );
    }
    return content;
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
      />
    )
  }
}

export default ProjectCard
