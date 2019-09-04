import React from 'react';
import PropTypes from 'prop-types';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { TextField } from 'material-ui';

export default class URLInput extends React.Component {
  render() {
    let {
      handleURLInputChange, importLink, translate,
    } = this.props;
    return (
      <MuiThemeProvider>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
        }}>
          <TextField
            style={{ width: '100%', borderRadius: '4px' }}
            floatingLabelText={translate('projects.enter_url')}
            underlineFocusStyle={{ borderColor: 'var(--accent-color-dark)' }}
            floatingLabelStyle={{
              color: 'var(--text-color-dark)', opacity: '0.3', fontWeight: '500',
            }}
            onChange={e => handleURLInputChange(e.target.value)}
            value={importLink}
          />
        </div>
      </MuiThemeProvider>
    );
  }
}

URLInput.propTypes = {
  translate: PropTypes.func.isRequired,
  handleURLInputChange: PropTypes.func.isRequired,
  importLink: PropTypes.string.isRequired,
};

