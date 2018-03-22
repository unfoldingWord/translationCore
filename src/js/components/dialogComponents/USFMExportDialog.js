import React from 'react';
import PropTypes from 'prop-types';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { RadioButton } from 'material-ui/RadioButton';
import { withLocale } from '../../containers/Locale';
import { connect } from 'react-redux';

const USFMExportDialog = ({ selected, onSelect }) => {
  return (
    <MuiThemeProvider>
      <div>
        <div style={{ fontSize: 15, marginTop: 20, marginBottom: 20 }}>
          {'Please select the desired format for your project export.'}
        </div>
        <div>
          <RadioButton
          iconStyle={{fill: 'black'}}
            checked={selected === 'usfm2'}
            label={'USFM 2 - only preserves the text of your translation'}
            onCheck={() => onSelect('usfm2')}
          />
          <RadioButton
            iconStyle={{ fill: 'black' }}
            checked={selected === 'usfm3'}
            label={'USFM 3 - preserves the text and alignment data of your translation.'}
            onCheck={() => onSelect('usfm3')}
          />
        </div>
      </div>
    </MuiThemeProvider>
  );
};
USFMExportDialog.propTypes = {
  selected: PropTypes.string,
  onSelect: PropTypes.func.isRequired
};

const mapStateToProps = (state) => ({
  selected: state.settingsReducer.currentSettings.usfmExportType
});

export default withLocale(connect(mapStateToProps)(USFMExportDialog));
