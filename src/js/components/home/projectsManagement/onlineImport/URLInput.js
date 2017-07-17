import React from 'react';
import PropTypes from 'prop-types';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { TextField } from 'material-ui';

export default class URLInput extends React.Component {
  render() {
    let { loadProjectFromLink, handleURLInputChange, importLink } = this.props;
    return (
      <MuiThemeProvider>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <TextField
            style={{ width: '70%', borderRadius: '4px' }}
            floatingLabelText="Enter URL"
            underlineFocusStyle={{ borderColor: "var(--accent-color-dark)" }}
            floatingLabelStyle={{ color: "var(--text-color-dark)", opacity: "0.3", fontWeight: "500" }}
            onChange={handleURLInputChange}
            value={importLink}
          />
          <button
            className="btn-prime"
            disabled={!importLink}
            onClick={loadProjectFromLink}
            style={{ margin: "0px" }}
          >
            <span style={{ marginLeft: '10px' }}>
              Import & Select
            </span>
          </button>
        </div>
      </MuiThemeProvider>
    );
  }
}

URLInput.propTypes = {
  handleURLInputChange: PropTypes.func.isRequired,
  loadProjectFromLink: PropTypes.func.isRequired,
  importLink: PropTypes.string.isRequired
};

