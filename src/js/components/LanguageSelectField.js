import React from 'react';
import PropTypes from 'prop-types';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import { getLanguageTranslation } from '../helpers/localizationHelpers';

/**
 * Represents a select field for languages
 * @param {string} selectedLanguageCode the language code that is currently selected
 * @param {array} languages an array of language objects with a code and name.
 * @param {func} onChange the call back when an item is chosen.
 * @param {Function} translate
 * @return {*}
 * @constructor
 */
const LanguageSelectField = ({
  selectedLanguageCode,
  languages,
  onChange,
  translate,
}) => (
  <SelectField
    value={selectedLanguageCode}
    style={{ textAlign: 'left' }}
    onChange={(e, key, payload) => onChange(payload)}
    underlineFocusStyle={{ borderColor: 'var(--accent-color-dark)' }}
  >
    {languages.map((language, key) => {
      const languageLocalized = getLanguageTranslation(translate, language.name, language.code);
      return <MenuItem key={key}
        value={language.code}
        primaryText={languageLocalized}/>;
    })}
  </SelectField>
);

LanguageSelectField.propTypes = {
  translate: PropTypes.func.isRequired,
  selectedLanguageCode: PropTypes.string.isRequired,
  languages: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
};
export default LanguageSelectField;
