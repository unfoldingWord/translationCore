/* eslint-disable no-console */
import React from 'react';
import PropTypes from 'prop-types';
// components
import { AutoComplete } from 'material-ui';
import TranslateIcon from 'material-ui/svg-icons/action/translate';
import * as LangHelpers from "../../../helpers/LanguageHelpers";

const LanguageIdTextBox = ({
  languageId,
  languageName,
  updateLanguageName,
  updateLanguageId,
  updateLanguageDirection
}) => {
  return (
    <div>
      <AutoComplete
        searchText={languageId}
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
        onUpdateInput={searchText => {
            const language = LangHelpers.getLanguageByCode(searchText);
            if (language) {
              updateLanguageId(language.code);
              updateLanguageName(language.name);
              updateLanguageDirection(language.ltr ? "ltr" : "rtl");
            } else {
              updateLanguageId(searchText);
            }
          }
        }
        // autoFocus={languageId === "" && languageName.length > 0}
        filter={AutoComplete.caseInsensitiveFilter}
        dataSource={getLanguageIDs()}
        maxSearchResults={20}
      />
    </div>
  );
};

let languageIDs = null; // for list caching to speed up

export const getLanguageIDs = () => {
  if (!languageIDs) {
    languageIDs = [];
    const languageList = LangHelpers.getLanguages();
    for (let language of languageList) {
      languageIDs.push(language.code);
    }
    languageIDs.sort();
  }
  return languageIDs;
};

LanguageIdTextBox.propTypes = {
  languageId: PropTypes.string.isRequired,
  languageName: PropTypes.string.isRequired,
  updateLanguageName: PropTypes.func.isRequired,
  updateLanguageId: PropTypes.func.isRequired,
  updateLanguageDirection: PropTypes.func.isRequired
};

export default LanguageIdTextBox;
