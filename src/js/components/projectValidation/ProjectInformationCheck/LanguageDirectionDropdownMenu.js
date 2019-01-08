import React from 'react';
import PropTypes from 'prop-types';
// components
import { Glyphicon } from 'react-bootstrap';
import { SelectField, MenuItem } from 'material-ui';

const LanguageDirectionDropdownMenu = ({
  languageDirection,
  updateLanguageDirection,
  translate,
  id,
  className
}) => {
  return (
    <div
      id={id+'-wrapper'}
      className={className}
    >
      <SelectField
        id={id}
        value={languageDirection}
        style={{ minWidth: '256px' }}
        errorText={languageDirection === "" ? "This field is required." : null}
        errorStyle={{ color: '#cd0033' }}
        underlineFocusStyle={{ borderColor: "var(--accent-color-dark)" }}
        floatingLabelFixed={true}
        floatingLabelStyle={{ color: 'var(--text-color-dark)', fontSize: '22px', fontWeight: 'bold', top: '32px' }}
        floatingLabelText={
          <div style={{ width: '270px' }}>
            <Glyphicon glyph={"eye-open"} style={{ color: "#000000", fontSize: '28px' }} />&nbsp;
            <span>{translate('project_validation.language_direction')}</span>&nbsp;
            <span className={"required"}/>
          </div>
        }
        onChange={(event, index, value) => {
          updateLanguageDirection(value);
        }}
      >
        <MenuItem key="language-direction-empty-menu-item" value={""} primaryText={""} />
        <MenuItem key="ltr-menu-item" value={'ltr'} primaryText={translate('project_validation.ltr')} />
        <MenuItem key="rtr-menu-item" value={'rtl'} primaryText={translate('project_validation.rtl')} />
      </SelectField>
    </div>
  );
};

LanguageDirectionDropdownMenu.defaultProps = {
  id: 'language-direction-SelectField',
  className: 'language-irextion-select'
};

LanguageDirectionDropdownMenu.propTypes = {
  translate: PropTypes.func.isRequired,
  languageDirection: PropTypes.string.isRequired,
  updateLanguageDirection: PropTypes.func.isRequired,
  id: PropTypes.string,
  className: PropTypes.string
};

export default LanguageDirectionDropdownMenu;
