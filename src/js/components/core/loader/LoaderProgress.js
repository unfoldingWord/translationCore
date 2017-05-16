import React, { Component } from 'react';
import {Circle} from 'react-progressbar.js';

class LoaderProgress extends Component {
  render() {
    let toolsProgress = this.props.toolsProgress;
    let progress = 0;
    let toolNameToDisplay;
    for (var toolName in toolsProgress) {
      if (toolsProgress[toolName] && toolsProgress[toolName].progress) {
        toolNameToDisplay = toolName;
        progress = parseInt(toolsProgress[toolName].progress, 10);
      }
    }
    console.log(progress)
    return (
      <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: "20px"}}>
        <span>{"Loading " + toolNameToDisplay + " data"}</span>
        <Circle
          progress={progress}
          text={progress + "%"}
          options={{ strokeWidth: 15, color: "#4ABBE6", trailColor: "#FFF", trailWidth: 15 }}
          initialAnimate={true}
          containerStyle={{ width: '50px', height: '50px' }}
        />
      </div>
    );
  }
}

export default LoaderProgress;
