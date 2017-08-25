/* eslint-disable no-console */
import React from 'react';
import PropTypes from 'prop-types';
// components
import { TextField } from 'material-ui';
import TranslateIcon from 'material-ui/svg-icons/action/translate';

const LanguageIdTextBox = ({
  languageId,
  updateLanguageId
}) => {
  return (
    <div>
      <TextField
        value={languageId}
        style={{ width: '200px', height: '80px', marginTop: languageId === "" ? '30px' : '' }}
        errorText={languageId === "" ? "This field is required." : null}
        errorStyle={{ color: '#cd0033' }}
        underlineFocusStyle={{ borderColor: "var(--accent-color-dark)" }}
        floatingLabelFixed={true}
        floatingLabelStyle={{ color: "var(--text-color-dark)", fontSize: '22px', fontWeight: 'bold' }}
        floatingLabelText={
          <div style={{ width: '260px' }}>
            <TranslateIcon style={{ height: "28px", width: "28px", color: "#000000" }} />&nbsp;
            <span>Language Code</span>&nbsp;
            <span style={{ color: '#cd0033'}}>*</span>
          </div>
        }
        onChange={e => updateLanguageId(e.target.value)}
        autoFocus={languageId === "" ? true : false }
      />
    </div>
  );
}

LanguageIdTextBox.propTypes = {
  languageId: PropTypes.string.isRequired,
  updateLanguageId: PropTypes.func.isRequired
};

export default LanguageIdTextBox;
