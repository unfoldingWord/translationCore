import React from 'react';
import ProgressBar from 'react-bootstrap/lib/ProgressBar.js';
import Modal from 'react-bootstrap/lib/Modal.js';
import {Circle} from 'react-progressbar.js';
import Dialog from 'material-ui/Dialog';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

class Loader extends React.Component {
  render() {
    const {Bibles, translationWords, show, reloadContent} = this.props.loaderReducer;
    let biblesProgress = Bibles ? parseInt(Bibles.progress, 10) : 0;
    let tProgress = translationWords ? parseInt(translationWords.progress, 10) : 0;
    return (
      <MuiThemeProvider>
        <Dialog modal={true} open={show}>
          <div style={{height: "500px", display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: "20px"}}>
            <img src="images/TC_icon.png" className="App-logo" alt="logo" />
            <span>Loading Resources...</span><br />
            <span>translationWords</span>
              <Circle
                progress={tProgress}
                text={tProgress + "%"}
                options={{ strokeWidth: 15, color: "#4ABBE6", trailColor: "#FFF", trailWidth: 15 }}
                initialAnimate={true}
                containerStyle={{ width: '50px', height: '50px' }}
              />
            <span>Bibles</span>
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
