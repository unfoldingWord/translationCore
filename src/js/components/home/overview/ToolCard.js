import React, { Component } from 'react'
import TemplateCard from './TemplateCard'

class ToolCard extends Component {

  heading(callback) {
    return (
      <span>Current Tool <a onClick={callback}>Change Tool</a></span>
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
      />
    )
  }
}

export default ToolCard
