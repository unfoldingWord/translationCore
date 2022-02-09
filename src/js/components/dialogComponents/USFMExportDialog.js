import React from 'react';
import PropTypes from 'prop-types';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { Checkbox } from 'material-ui';
import { connect } from 'react-redux';
import { withLocale } from '../../helpers/localeHelpers';

const USFMExportDialog = ({
  translate, selected, onSelect,
}) => {
  function isSelected(selected) {
    return selected === 'usfm3';
  }

  function toggleSelection(selected) {
    const alignmentsSelected = !isSelected(selected); // toggle selection
    const newSelection = alignmentsSelected ? 'usfm3' : 'usfm2';
    onSelect(newSelection);
    return newSelection;
  }

  return (
    <MuiThemeProvider>
      <div style={{ marginLeft: 20 }}>
        <div style={{
          fontSize: 15, marginTop: 20, marginBottom: 20,
        }}>
          {translate('alignment_prompt')}
        </div>
        <div style={{ paddingLeft: 20 }}>
          <div>
            <Checkbox
              iconStyle={{ marginLeft: 10, fill: 'var(--accent-color-dark)' }}
              checked={isSelected(selected)}
              label={translate('include_alignment_check')}
              onCheck={() => {
                toggleSelection(selected);
              }}
            />
          </div>
        </div>
      </div>
    </MuiThemeProvider>
  );
};

USFMExportDialog.propTypes = {
  translate: PropTypes.func.isRequired,
  selected: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({ selected: state.settingsReducer.currentSettings.usfmExportType });

export default withLocale(connect(mapStateToProps)(USFMExportDialog));
