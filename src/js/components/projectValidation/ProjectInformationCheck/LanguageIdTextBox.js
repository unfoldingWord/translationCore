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
        style={{ width: '150px' }}
        underlineFocusStyle={{ borderColor: "var(--accent-color-dark)" }}
        floatingLabelStyle={{ color: "var(--text-color-dark)", opacity: "1", fontWeight: "bold" }}
        floatingLabelText={
          <div style={{ width: '150px' }}>
            <TranslateIcon style={{ height: "20px", width: "20px", color: "#000000" }} />&nbsp;
            <span>Language Id</span>&nbsp;
            <span style={{ color: '#800020'}}>*</span>
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
