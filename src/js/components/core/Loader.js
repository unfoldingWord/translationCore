import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import {Circle} from 'react-progressbar.js';
import Dialog from 'material-ui/Dialog';


class Loader extends React.Component {
  render() {
    const {Bibles, translationWords, translationNotes, show, reloadContent} = this.props.loaderReducer;
    let { toolTitle } = this.props.currentToolReducer;
    let biblesProgress = Bibles ? parseInt(Bibles.progress, 10) : 0;
    let tProgress = 0;
    if (translationWords) {
      tProgress = parseInt(translationWords.progress, 10);
    } else if (translationNotes) {
      tProgress = parseInt(translationNotes.progress, 10);
    }

    return (
      <MuiThemeProvider>
        <Dialog modal={true} open={show}>
          <div style={{height: "500px", display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: "20px"}}>
            <img src="images/TC_icon.png" className="App-logo" alt="logo" />
            <span>Loading...</span><br />
            <span>{"Loading " + toolTitle + " data"}</span>
              <Circle
                progress={tProgress}
                text={tProgress + "%"}
                options={{ strokeWidth: 15, color: "#4ABBE6", trailColor: "#FFF", trailWidth: 15 }}
                initialAnimate={true}
                containerStyle={{ width: '50px', height: '50px' }}
              />
            <span>{"Loading bibles data"}</span>
              <Circle
                progress={biblesProgress}
                text={biblesProgress + "%"}
                options={{ strokeWidth: 15, color: "#4ABBE6", trailColor: "#FFF", trailWidth: 15 }}
                initialAnimate={true}
                containerStyle={{ width: '50px', height: '50px' }}
              />
            <br/><br/>
            {reloadContent}
          </div>
        </Dialog>
      </MuiThemeProvider>
    );
  }
}

export default Loader;
