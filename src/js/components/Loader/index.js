import React from 'react';
import PropTypes from 'prop-types';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Dialog from 'material-ui/Dialog';

class Loader extends React.Component {
  render() {
    const { show } = this.props.loaderReducer;
    const {translate} = this.props;
    return (
      <MuiThemeProvider>
        <Dialog modal={true} open={show}>
          <div style={{height: "500px", display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: "20px"}}>
            <img className="App-logo" src="./images/TC_Icon.png" alt="logo" style={{height: "350px", margin: "15px"}}/>
            <span style={{margin: "20px"}}>{translate('projects.loading_ellipsis')}</span>
          </div>
        </Dialog>
      </MuiThemeProvider>
    );
  }
}

Loader.propTypes = {
  loaderReducer: PropTypes.any.isRequired,
  translate: PropTypes.func.isRequired
};

export default Loader;
