import React, { Component } from 'react'
import TemplateCard from './TemplateCard'

class ToolCard extends Component {

  heading() {
    return (<span>Current Tool <a>Change Tool</a></span>);
  }

  content() {
    let content = (
      <div>
        <strong>Tool Name</strong>
        <p>Tool Details</p>
      </div>
    );
    content = (
      <div style={{ textAlign: 'center' }}>
        Select a tool<br/>
        <button>Tool</button>
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

export default ToolCard
