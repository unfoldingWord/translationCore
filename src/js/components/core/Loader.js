import React from 'react';
import path from 'path-extra';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import {Circle} from 'react-progressbar.js';
import Dialog from 'material-ui/Dialog';


class Loader extends React.Component {

  displayProgress(toolsProgress) {
    let progressCircle = [];
    for (var toolName in toolsProgress) {
      if (toolsProgress[toolName] && toolsProgress[toolName].progress) {
        let progress = parseInt(toolsProgress[toolName].progress, 10);
        progressCircle.push(
          <div key={toolName} style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: "20px"}}>
            <span>{"Loading " + toolName + " data"}</span>
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
    return progressCircle
  }



  render() {
    const {toolsProgress, show, reloadContent} = this.props.loaderReducer;
    return (
      <MuiThemeProvider>
        <Dialog modal={true} open={show}>
          <div style={{height: "500px", display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: "20px"}}>
            <img className="App-logo" height="300px" src={path.join(window.__base, "images/TC_icon.png")} alt="logo" />
            <span>Loading...</span><br />
            {this.displayProgress(toolsProgress)}
            <br/><br/>
            {reloadContent}
          </div>
        </Dialog>
      </MuiThemeProvider>
    );
  }
}

export default Loader;
