import React from 'react';
import PropTypes from 'prop-types';
// components
import { Glyphicon } from 'react-bootstrap';
import { SelectField, MenuItem } from 'material-ui';

const LanguageDirectionDropdownMenu = ({
  languageDirection,
  updateLanguageDirection,
  translate
}) => {
  return (
    <div>
      <SelectField
        value={languageDirection}
        style={{ width: '200px', marginTop: languageDirection === "" ? '30px' : '' }}
        errorText={languageDirection === "" ? "This field is required." : null}
        errorStyle={{ color: '#cd0033' }}
        underlineFocusStyle={{ borderColor: "var(--accent-color-dark)" }}
        floatingLabelFixed={true}
        floatingLabelStyle={{ color: 'var(--text-color-dark)', fontSize: '22px', fontWeight: 'bold', top: '32px' }}
        floatingLabelText={
          <div style={{ width: '270px' }}>
            <Glyphicon glyph={"eye-open"} style={{ color: "#000000", fontSize: '28px' }} />&nbsp;
            <span>{translate('project_validation.language_direction')}</span>&nbsp;
            <span style={{ color: '#cd0033'}}>*</span>
          </div>
        }
        onChange={(event, index, value) => {
          updateLanguageDirection(value);
        }}
      >
        <MenuItem value={""} primaryText={""} />
        <MenuItem value={'ltr'} primaryText={translate('project_validation.ltr')} />
        <MenuItem value={'rtl'} primaryText={translate('project_validation.rtl')} />
      </SelectField>
    </div>
  );
};

LanguageDirectionDropdownMenu.propTypes = {
  translate: PropTypes.func.isRequired,
  languageDirection: PropTypes.string.isRequired,
  updateLanguageDirection: PropTypes.func.isRequired
};

export default LanguageDirectionDropdownMenu;
