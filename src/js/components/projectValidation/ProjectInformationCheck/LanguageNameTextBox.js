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
        onNewRequest={(chosenRequest, index) => {
          selectLanguage(chosenRequest, index, updateLanguageName, updateLanguageId, updateLanguageDirection);
          }
        }
        // autoFocus={languageName.length === 0}
        filter={AutoComplete.caseInsensitiveFilter}
        dataSource={getLanguages()}
        dataSourceConfig={dataSourceConfig}
        maxSearchResults={30}
      />
    </div>
  );
};

const dataSourceConfig = {
  text: 'name',
  value: 'code'
};

const updateLanguage = (language, updateLanguageName, updateLanguageId, updateLanguageDirection) => {
  updateLanguageName(language.name);
  updateLanguageId(language.code);
  updateLanguageDirection(language.ltr ? "ltr" : "rtl");
};

export const selectLanguage = (languageStr, index, updateLanguageName, updateLanguageId, updateLanguageDirection) => {
  if (index >= 0) { // if language in list, update all fields
    const language = getLanguages()[index];
    if (language) {
      updateLanguage(language, updateLanguageName, updateLanguageId, updateLanguageDirection);
      return;
    }
  } else {
    const language = LangHelpers.getLanguageByName(languageStr); // try case insensitive search
    if (language) {
      updateLanguage(language, updateLanguageName, updateLanguageId, updateLanguageDirection);
      return;
    }
  }
  updateLanguageName(languageStr); // if no match, then just set string
};

let languageList = null; // list caching for speed up

export const getLanguages = () => {
  if (!languageList) {
    languageList = LangHelpers.getLanguages().slice(0); // clone list
    languageList.sort(function (a, b) { // sort by language name
      return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);
    });
  }
  return languageList;
};

LanguageNameTextBox.propTypes = {
  languageName: PropTypes.string.isRequired,
  updateLanguageName: PropTypes.func.isRequired,
  updateLanguageId: PropTypes.func.isRequired,
  updateLanguageDirection: PropTypes.func.isRequired
};

export default LanguageNameTextBox;
