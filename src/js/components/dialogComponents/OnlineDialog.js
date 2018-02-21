import React from 'react';
import PropTypes from 'prop-types';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { Checkbox } from 'material-ui';
import { withLocale } from '../../containers/Locale';
import { connect } from 'react-redux';

const OnlineDialog = ({translate, checked, onChecked}) => {
  return (
    <MuiThemeProvider>
      <div>
        <p style={{fontSize: 15}}>
          {translate('network_warning')}
        </p>
        <div style={{display: 'flex'}}>
          <Checkbox
            style={{width: '0px', marginRight: -10}}
            iconStyle={{fill: 'black'}}
            checked={checked}
            labelStyle={{
              color: 'var(--reverse-color)',
              opacity: '0.7',
              fontWeight: '500'
            }}
            onCheck={(e) => {
              onChecked(e.target.checked);
            }}
          />
          {translate('hide_warning')}
        </div>
      </div>
    </MuiThemeProvider>
  );
};
OnlineDialog.propTypes = {
  translate: PropTypes.func,
  checked: PropTypes.bool,
  onChecked: PropTypes.func.isRequired
};

const mapStateToProps = (state) => ({
  checked: state.settingsReducer.onlineMode
});

export default withLocale(connect(mapStateToProps)(OnlineDialog));
