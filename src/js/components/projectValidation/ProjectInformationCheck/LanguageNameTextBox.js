/* eslint-disable no-console */
import React from 'react';
import PropTypes from 'prop-types';
// components
import { SelectField, MenuItem } from 'material-ui';
import TranslateIcon from 'material-ui/svg-icons/action/translate';
import * as LangHelpers from '../../../helpers/LanguageHelpers';

const LanguageNameTextBox = ({
  languageName,
  updateLanguageName
}) => {
  return (
    <div>
      <SelectField
        value={languageName}
        style={{ width: '200px', height: '80px', marginTop: languageName === "" ? '30px' : '' }}
        errorText={languageName === "" ? "This field is required." : null}
        errorStyle={{ color: '#cd0033' }}
        underlineFocusStyle={{ borderColor: "var(--accent-color-dark)" }}
        floatingLabelFixed={true}
        floatingLabelStyle={{ color: "var(--text-color-dark)", fontSize: '22px', fontWeight: 'bold' }}
        floatingLabelText={
          <div style={{ width: '260px' }}>
            <TranslateIcon style={{ height: "28px", width: "28px", color: "#000000" }} />&nbsp;
            <span>Language Name</span>&nbsp;
            <span style={{ color: '#cd0033'}}>*</span>
          </div>
        }
        onChange={e => updateLanguageName(e.target.value)}
        autoFocus={languageName.length === 0 ? true : false}
      >
      <MenuItem value={""} primaryText={""} />
      {
        getLanguageIDs().forEach(language => {
          const code = language.code;
          return (
            <MenuItem key={code} value={code} primaryText={language.text} />
          );
        })
      }
      </SelectField>
    </div>
  );
};

export const getLanguageNames = () => {
  const languageList = LangHelpers.getLanguages();
  languageList.sort(function(a,b) {return (a.text > b.text) ? 1 : ((b.text > a.text) ? -1 : 0) } );
  return languageList;
};

LanguageNameTextBox.propTypes = {
  languageName: PropTypes.string.isRequired,
  updateLanguageName: PropTypes.func.isRequired
};

export default LanguageNameTextBox;
