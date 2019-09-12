/* eslint-disable no-console */
import React from 'react';
import PropTypes from 'prop-types';
// components
import { AutoComplete } from 'material-ui';
import TranslateIcon from 'material-ui/svg-icons/action/translate';
import * as LangHelpers from '../../../helpers/LanguageHelpers';

const LanguageIdTextBox = ({
  languageId,
  updateLanguageName,
  updateLanguageId,
  updateLanguageSettings,
  translate,
  id,
  className,
}) => {
  const caseInsensitiveLeadingFilter = function (searchText, key) {
    return key.toLowerCase().indexOf(searchText.toLowerCase()) === 0;
  };

  return (
    <div
      id={id+'-wrapper'}
      className={className}
    >
      <label htmlFor={id} style={{ margin: 0 }}>
        <TranslateIcon style={{
          height: '16px', width: '16px', color: '#000000', verticalAlign: 'bottom',
        }} />&nbsp;
        <span>{translate('projects.language_code')}</span>&nbsp;
        <span className={'required'}/>
      </label>
      <AutoComplete
        id={id}
        searchText={languageId}
        style={{ height: '80px' }}
        listStyle={{ maxHeight: 300, overflow: 'auto' }}
        errorText={getErrorMessage(translate, languageId)}
        errorStyle={{ color: '#cd0033' }}
        underlineFocusStyle={{ borderColor: 'var(--accent-color-dark)' }}
        onNewRequest={(chosenRequest, index) => {
          selectLanguage(chosenRequest, index, updateLanguageName, updateLanguageId, updateLanguageSettings);
        }
        }
        onUpdateInput={searchText => {
          selectLanguage(searchText, -1, updateLanguageName, updateLanguageId, updateLanguageSettings);
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
  value: 'code',
};

/**
 * @description - generate error message if languageID is not valid
 * @param {func} translate the translation function
 * @param {string} languageID
 * @return {String} error message if invalid, else null
 */
export const getErrorMessage = (translate, languageID = '') => {
  let message = (!languageID) ? translate('project_validation.field_required') : '';

  if (!message) {
    if (!LangHelpers.getLanguageByCodeSelection(languageID)) {
      message = translate('project_validation.invalid_language_code');
    }
  }
  return message;
};

/**
 * @description - updates the ID, name and direction fields from language object.
 * @param {object} language
 * @param {function} updateLanguageSettings -function to call to save language data
 */
const updateLanguage = (language, updateLanguageSettings) => {
  updateLanguageSettings(language.code, language.name, language.ltr ? 'ltr' : 'rtl');
};

/**
 * @description - looks up the language by code or index and then updates the ID, name and direction fields.
 * @param {string|object} chosenRequest - either string value of text entry, otherwise selected object in menu
 * @param {int} index - if >= 0 then this was a menu selection and chosenRequest will be an object, otherwise
 *                chosenRequest is a string from text entry
 * @param {function} updateLanguageName -function to call to save language name
 * @param {function} updateLanguageId -function to call to save language id
 * @param {function} updateLanguageSettings -function to call to save language data
 */
export const selectLanguage = (chosenRequest, index, updateLanguageName, updateLanguageId, updateLanguageSettings) => {
  if (index >= 0) { // if language in list, update all fields
    const language = LangHelpers.getLanguagesSortedByCode()[index];

    if (language) {
      updateLanguage(language, updateLanguageSettings);
    }
  } else {
    const language = LangHelpers.getLanguageByCodeSelection(chosenRequest); // try case insensitive search

    if (language) {
      updateLanguage(language, updateLanguageSettings);
    } else {
      updateLanguageId(chosenRequest || ''); // temporarily queue str change
      updateLanguageName(''); // clear associated code
    }
  }
};

LanguageIdTextBox.defaultProps = {
  id: 'Language-Id-TextBox',
  className: 'language-id-textbox',
};

LanguageIdTextBox.propTypes = {
  translate: PropTypes.func.isRequired,
  languageId: PropTypes.string.isRequired,
  updateLanguageName: PropTypes.func.isRequired,
  updateLanguageId: PropTypes.func.isRequired,
  updateLanguageSettings: PropTypes.func.isRequired,
  id: PropTypes.string,
  className: PropTypes.string,
};

export default LanguageIdTextBox;
