/* eslint-disable no-console */
import React from 'react';
import PropTypes from 'prop-types';
// components
import { SelectField, MenuItem } from 'material-ui';
import TranslateIcon from 'material-ui/svg-icons/action/translate';
import * as LangHelpers from "../../../helpers/LanguageHelpers";

const LanguageIdTextBox = ({
  languageId,
  languageName,
  updateLanguageId
}) => {
  return (
    <div>
      <SelectField
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
        autoFocus={languageId === "" && languageName.length > 0 ? true : false}
      >
      <MenuItem value={""} primaryText={""} />
      {
        getLanguageIDs().forEach(language => {
          const code = language.code;
          return (
            <MenuItem key={code} value={code} primaryText={code} />
          );
        })
      }
      </SelectField>
    </div>
  );
};

export const getLanguageIDs = () => {
  const languageList = LangHelpers.getLanguages();
  languageList.sort(function(a,b) {return (a.code > b.code) ? 1 : ((b.code > a.code) ? -1 : 0) } );
  return languageList;
};

LanguageIdTextBox.propTypes = {
  languageId: PropTypes.string.isRequired,
  languageName: PropTypes.string.isRequired,
  updateLanguageId: PropTypes.func.isRequired
};

export default LanguageIdTextBox;
