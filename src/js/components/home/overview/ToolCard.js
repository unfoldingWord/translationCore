import React, { Component } from 'react'
import TemplateCard from './TemplateCard'

class ToolCard extends Component {

  heading(callback) {
    let link = this.content() ? <a onClick={callback}>Change Tool</a> : <a></a>
    return (
      <span>Current Tool {link}</span>
    );
  }

  content() {
    let content;
    let { toolName } = this.props.reducers.toolsReducer;
    if (toolName) {
      content = (
        <div>
          <strong>{toolName}</strong>
          <p>details</p>
        </div>
      );
    }
    return content;
  }

  disabled() {
    let { projectSaveLocation } = this.props.reducers.projectDetailsReducer;
    return !projectSaveLocation;
  }

  render() {
    let emptyMessage = 'Select a tool';
    let emptyButtonLabel = 'Tool';
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

export default ToolCard
