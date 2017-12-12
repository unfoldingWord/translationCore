/* eslint-disable no-console */
import React from 'react';
import PropTypes from 'prop-types';
// components
import { AutoComplete } from 'material-ui';
import TranslateIcon from 'material-ui/svg-icons/action/translate';
import * as LangHelpers from '../../../helpers/LanguageHelpers';

const LanguageNameTextBox = ({
  languageName,
  updateLanguageName,
  updateLanguageId,
  updateLanguageDirection
}) => {
  return (
    <div>
      <AutoComplete
        searchText={languageName}
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
        onUpdateInput={searchText => {
            const language = LangHelpers.getLanguageByName(searchText);
            if (language) {
              updateLanguageName(language.name);
              updateLanguageId(language.code);
              updateLanguageDirection(language.ltr ? "ltr" : "rtl");
            } else {
              updateLanguageName(searchText);
            }
          }
        }
        // autoFocus={languageName.length === 0}
        filter={AutoComplete.caseInsensitiveFilter}
        dataSource={getLanguageNames()}
        maxSearchResults={20}
      />
    </div>
  );
};

let languageNames = null; // for list caching to speed up

export const getLanguageNames = () => {
  if (!languageNames) {
    languageNames = [];
    const languageList = LangHelpers.getLanguages();
    for (let language of languageList) {
      languageNames.push(language.name);
    }
    languageNames.sort();
  }
  return languageNames;
};

LanguageNameTextBox.propTypes = {
  languageName: PropTypes.string.isRequired,
  updateLanguageName: PropTypes.func.isRequired,
  updateLanguageId: PropTypes.func.isRequired,
  updateLanguageDirection: PropTypes.func.isRequired
};

export default LanguageNameTextBox;
