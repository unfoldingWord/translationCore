import React from 'react';
import PropTypes from 'prop-types';
// components
import { Glyphicon } from 'react-bootstrap';
import { SelectField, MenuItem } from 'material-ui';

const LanguageDirectionTextBox = ({
  languageDirection,
  updateLanguageDirection
}) => {
  const ltrText = 'Left to Right';
  const rtlText = 'Right to Left';
  let textDirection;

  if (languageDirection) {
    textDirection = languageDirection === 'ltr' ? ltrText : rtlText;
  } else {
    textDirection = '';
  }

  return (
    <div>
      <SelectField
        value={languageDirection}
        style={{ width: '220px' }}
        underlineFocusStyle={{ borderColor: "var(--accent-color-dark)" }}
        floatingLabelStyle={{ color: '#000' }}
        floatingLabelText={
          <div>
            <Glyphicon glyph={"eye-open"} style={{ color: "#000000" }} />&nbsp;
            <span>Reading Direction</span>&nbsp;
            <span style={{ color: '#800020'}}>*</span>
          </div>
        }
        onChange={(event, index, value) => {
          updateLanguageDirection(value);
        }}
      >
      <MenuItem value={languageDirection} primaryText={textDirection} />
        <MenuItem value={'ltr'} primaryText={ltrText} />
        <MenuItem value={'rtl'} primaryText={rtlText} />
      </SelectField>
    </div>
  );
}

LanguageDirectionTextBox.propTypes = {
  languageDirection: PropTypes.string.isRequired,
  updateLanguageDirection: PropTypes.func.isRequired
};

export default LanguageDirectionTextBox;