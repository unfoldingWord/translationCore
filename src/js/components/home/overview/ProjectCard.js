import React, { Component } from 'react'
import TemplateCard from './TemplateCard'

class ProjectCard extends Component {

  heading() {
    return (<span>Current Project <a>Change Project</a></span>);
  }

  content() {
    let content = (
      <div>
        <strong>Project Name</strong>
        <p>Project Details</p>
      </div>
    );
    content = (
      <div style={{ textAlign: 'center' }}>
        Select a project<br/>
        <button>Project</button>
      </div>
    );
    return content;
  }

  render() {
    return (
      <TemplateCard heading={this.heading()} content={this.content()} />
    )
  }
}

export default ProjectCard
