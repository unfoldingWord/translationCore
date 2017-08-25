import React from 'react';
import PropTypes from 'prop-types';
// components
import { Glyphicon } from 'react-bootstrap';
import { SelectField, MenuItem } from 'material-ui';

const LanguageDirectionDropdownMenu = ({
  languageDirection,
  updateLanguageDirection
}) => {
  return (
    <div>
      <SelectField
        value={languageDirection}
        style={{ width: '200px' }}
        underlineFocusStyle={{ borderColor: "var(--accent-color-dark)" }}
        floatingLabelFixed={true}
        floatingLabelStyle={{ color: 'var(--text-color-dark)', fontSize: '22px', fontWeight: 'bold', top: '32px' }}
        floatingLabelText={
          <div style={{ width: '270px' }}>
            <Glyphicon glyph={"eye-open"} style={{ color: "#000000", fontSize: '28px' }} />&nbsp;
            <span>Language Direction</span>&nbsp;
            <span style={{ color: '#800020'}}>*</span>
          </div>
        }
        onChange={(event, index, value) => {
          updateLanguageDirection(value);
        }}
      >
        <MenuItem value={""} primaryText={""} />
        <MenuItem value={'ltr'} primaryText={'Left to Right'} />
        <MenuItem value={'rtl'} primaryText={'Right to Left'} />
      </SelectField>
    </div>
  );
}

LanguageDirectionDropdownMenu.propTypes = {
  languageDirection: PropTypes.string.isRequired,
  updateLanguageDirection: PropTypes.func.isRequired
};

export default LanguageDirectionDropdownMenu;