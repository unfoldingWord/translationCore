import React from 'react';
import path from 'path-extra';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import {Circle} from 'react-progressbar.js';
import Dialog from 'material-ui/Dialog';

class Loader extends React.Component {
  render() {
    const { show, showCancelButton } = this.props.loaderReducer;
    const { cancelLoadingProject } = this.props.actions;
    return (
      <MuiThemeProvider>
        <Dialog modal={true} open={show}>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: "20px"}}>
            <img className="App-logo" src="./images/TC_Icon.png" alt="logo" style={{height: "350px", margin: "15px"}}/>
            <span style={{margin: "20px"}}>Loading ...</span>
            {showCancelButton ?
              <button
              className={"btn-prime"}
              onClick={cancelLoadingProject}>
                Cancel
            </button>
              : null}
          </div>
        </Dialog>
      </MuiThemeProvider>
    );
  }
}

export default Loader;
