/* eslint-disable no-console */
import React from 'react';
import PropTypes from 'prop-types';
// components
import { AutoComplete } from 'material-ui';
import TranslateIcon from 'material-ui/svg-icons/action/translate';
import * as LangHelpers from "../../../helpers/LanguageHelpers";

const LanguageIdTextBox = ({
  languageId,
  updateLanguageName,
  updateLanguageId,
  updateLanguageAll,
  translate
}) => {

  const caseInsensitiveLeadingFilter = function (searchText, key) {
    return key.toLowerCase().indexOf(searchText.toLowerCase()) === 0;
  };

  return (
    <div>
      <AutoComplete
        searchText={languageId}
        style={{ width: '200px', height: '80px', marginTop: languageId === "" ? '30px' : '' }}
        listStyle={{ maxHeight: 300, overflow: 'auto' }}
        errorText={getErrorMessage(translate, languageId)}
        errorStyle={{ color: '#cd0033' }}
        underlineFocusStyle={{ borderColor: "var(--accent-color-dark)" }}
        floatingLabelFixed={true}
        floatingLabelStyle={{ color: "var(--text-color-dark)", fontSize: '22px', fontWeight: 'bold' }}
        floatingLabelText={
          <div style={{ width: '260px' }}>
            <TranslateIcon style={{ height: "28px", width: "28px", color: "#000000" }} />&nbsp;
            <span>{translate('language_code')}</span>&nbsp;
            <span style={{ color: '#cd0033'}}>*</span>
          </div>
        }
        onNewRequest={(chosenRequest, index) => {
            selectLanguage(chosenRequest, index, updateLanguageName, updateLanguageId, updateLanguageAll);
          }
        }
        onUpdateInput={searchText => {
            selectLanguage(searchText, -1, updateLanguageName, updateLanguageId, updateLanguageAll);
          }
        }
        filter={caseInsensitiveLeadingFilter}
        dataSource={LangHelpers.getLanguagesSortedByCode()}
        dataSourceConfig={dataSourceConfig}
        maxSearchResults={100}
      />
    </div>
  );
};

const dataSourceConfig = {
  text: 'idPrompt',
  value: 'code'
};

/**
 * @description - generate error message if languageID is not valid
 * @param {func} translate the translation function
 * @param {string} languageID
 * @return {String} error message if invalid, else null
 */
export const getErrorMessage = (translate, languageID = "") => {
  let message = (!languageID) ? translate('home.project.validate.field_required') : "";
  if (!message) {
    if (!LangHelpers.getLanguageByCodeSelection(languageID)) {
      message = translate('home.project.validate.invalid_language_code');
    }
  }
  return message;
};

/**
 * @description - updates the ID, name and direction fields from language object.
 * @param {object} language
 * @param {function} updateLanguageAll -function to call to save language data
 */
const updateLanguage = (language, updateLanguageAll) => {
  updateLanguageAll(language.code, language.name, language.ltr ? "ltr" : "rtl");
};

/**
 * @description - looks up the language by code or index and then updates the ID, name and direction fields.
 * @param {string|object} chosenRequest - either string value of text entry, otherwise selected object in menu
 * @param {int} index - if >= 0 then this was a menu selection and chosenRequest will be an object, otherwise
 *                chosenRequest is a string from text entry
 * @param {function} updateLanguageName -function to call to save language name
 * @param {function} updateLanguageId -function to call to save language id
 * @param {function} updateLanguageAll -function to call to save language data
 */
export const selectLanguage = (chosenRequest, index, updateLanguageName, updateLanguageId, updateLanguageAll) => {
  if (index >= 0) { // if language in list, update all fields
    const language = LangHelpers.getLanguagesSortedByCode()[index];
    if (language) {
      updateLanguage(language, updateLanguageAll);
    }
  } else {
    const language = LangHelpers.getLanguageByCodeSelection(chosenRequest); // try case insensitive search
    if (language) {
      updateLanguage(language, updateLanguageAll);
    } else {
      updateLanguageId(chosenRequest || ""); // temporarily queue str change
      updateLanguageName(""); // clear associated code
    }
  }
};

LanguageIdTextBox.propTypes = {
  translate: PropTypes.func.isRequired,
  languageId: PropTypes.string.isRequired,
  updateLanguageName: PropTypes.func.isRequired,
  updateLanguageId: PropTypes.func.isRequired,
  updateLanguageAll: PropTypes.func.isRequired
};

export default LanguageIdTextBox;
