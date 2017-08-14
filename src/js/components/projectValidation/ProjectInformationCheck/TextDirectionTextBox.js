import React from 'react';
import PropTypes from 'prop-types';
// components
import { Glyphicon } from 'react-bootstrap';
import { SelectField, MenuItem } from 'material-ui';

const TextDirectionTextBox = ({
  textDirectionValue
  //updateBookIdValue
}) => {
  const ltrText = 'Left to Right';
  const rtlText = 'Right to Left';
  let directionText;

  if (textDirectionValue) {
    directionText = textDirectionValue === 'ltr' ? ltrText : rtlText;
  } else {
    directionText = '';
  }

  return (
    <div>
      <SelectField
        value={textDirectionValue}
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
          //updateBookIdValue(value);
        }}
      >
      <MenuItem value={textDirectionValue} primaryText={directionText} />
        <MenuItem value={'ltr'} primaryText={ltrText} />
        <MenuItem value={'rtl'} primaryText={rtlText} />
      </SelectField>
    </div>
  );
}

TextDirectionTextBox.propTypes = {
  textDirectionValue: PropTypes.string.isRequired
  // updateBookIdValue: PropTypes.func.isRequired
};

export default TextDirectionTextBox;