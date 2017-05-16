import React from 'react';
import path from 'path-extra';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import {Circle} from 'react-progressbar.js';
import Dialog from 'material-ui/Dialog';

class Loader extends React.Component {
  render() {
    const { show } = this.props.loaderReducer;
    return (
      <MuiThemeProvider>
        <Dialog modal={true} open={show}>
          <div style={{height: "500px", display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: "20px"}}>
            <img className="App-logo" src={path.join(window.__base, "images/TC_icon.png")} alt="logo" />
            <span>Loading...</span>
            <br />
            <br/>
          </div>
        </Dialog>
      </MuiThemeProvider>
    );
  }
}

export default Loader;
