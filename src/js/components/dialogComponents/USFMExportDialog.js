import React from 'react';
import PropTypes from 'prop-types';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { RadioButton } from 'material-ui/RadioButton';
import { withLocale } from '../../containers/Locale';
import { connect } from 'react-redux';

const USFMExportDialog = ({ translate, checked1, checked2, onSelect }) => {
  return (
    <MuiThemeProvider>
      <div>
        <p style={{ fontSize: 15 }}>
          {translate('usfm_export_choice')}
        </p>
        <div style={{ display: 'flex' }}>
          <RadioButton
            checked={checked1}
            label={}
            onCheck={() => onSelect(1)}
          />
          <RadioButton
            checked={checked2}
            label={}
            onCheck={() => onSelect(2)}
          />
          {translate('hide_warning')}
        </div>
      </div>
    </MuiThemeProvider>
  );
};
USFMExportDialog.propTypes = {
  translate: PropTypes.func,
  checked1: PropTypes.bool,
  checked2:  PropTypes.bool,
  onSelect: PropTypes.func.isRequired
};

const mapStateToProps = (state) => ({
  checked1: ,
  checked2: 
});

export default withLocale(connect(mapStateToProps)(USFMExportDialog));
