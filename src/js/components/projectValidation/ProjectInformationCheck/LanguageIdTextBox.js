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
  updateLanguageDirection
}) => {
  return (
    <div>
      <AutoComplete
        searchText={languageId}
        style={{ width: '200px', height: '80px', marginTop: languageId === "" ? '30px' : '' }}
        listStyle={{ maxHeight: 400, overflow: 'auto' }}
        errorText={getErrorMessage(languageId)}
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
        onNewRequest={chosenRequest => {
            selectLanguage(chosenRequest, updateLanguageId, updateLanguageName, updateLanguageDirection);
          }
        }
        onUpdateInput={searchText => {
          selectLanguage(searchText, updateLanguageId, updateLanguageName, updateLanguageDirection);
          }
        }
        filter={AutoComplete.caseInsensitiveFilter}
        dataSource={LangHelpers.getLanguages()}
        dataSourceConfig={dataSourceConfig}
        maxSearchResults={40}
      />
    </div>
  );
};

const dataSourceConfig = {
  text: 'code',
  value: 'code'
};

/**
 * @description - generate error message if languageID is not valid
 * @param languageID
 * @return {String} error message if invalid, else null
 */
export const getErrorMessage = (languageID) => {
  languageID = languageID || "";
  let message = (languageID === "") ? "This field is required." : "";
  if (!message) {
    if (!LangHelpers.isLanguageCodeValid(languageID)) {
      message = "Language ID is not valid";
    }
  }
  return message;
};

/**
 * @description - looks up the language by code and then updates the ID, name and direction fields.
 * @param {string|object} chosenRequest - either string value of text entry, otherwise selected object in menu
 * @param {function} updateLanguageName -function to call to save language name
 * @param {function} updateLanguageId -function to call to save language id
 * @param {function} updateLanguageDirection -function to call to save language direction
 */
export const selectLanguage = (chosenRequest, updateLanguageId, updateLanguageName, updateLanguageDirection) => {
  const languageID = (typeof chosenRequest === 'string') ? chosenRequest : (chosenRequest ? chosenRequest.code : null);
  const language = LangHelpers.getLanguageByCode(languageID);
  if (language) { // if language defined, update all fields
    updateLanguageId(language.code);
    updateLanguageName(language.name);
    updateLanguageDirection(language.ltr ? "ltr" : "rtl");
  } else {
    updateLanguageId(chosenRequest || ""); // temporarily queue str change
    updateLanguageName(""); // clear associated code
  }
};

LanguageIdTextBox.propTypes = {
  languageId: PropTypes.string.isRequired,
  updateLanguageName: PropTypes.func.isRequired,
  updateLanguageId: PropTypes.func.isRequired,
  updateLanguageDirection: PropTypes.func.isRequired
};

export default LanguageIdTextBox;
