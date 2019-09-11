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
  className,
}) => (
  <div
    id={id+'-wrapper'}
    className={className}
  >
    <label htmlFor={id} style={{ margin: 0 }}>
      <Glyphicon glyph={'eye-open'} style={{ color: '#000000', fontSize: '16px' }} />&nbsp;
      <span>{translate('project_validation.language_direction')}</span>&nbsp;
      <span className={'required'}/>
    </label>
    <SelectField
      id={id}
      value={languageDirection}
      errorText={languageDirection === '' ? translate('project_validation.field_required') : null}
      errorStyle={{ color: '#cd0033' }}
      underlineFocusStyle={{ borderColor: 'var(--accent-color-dark)' }}
      onChange={(event, index, value) => {
        updateLanguageDirection(value);
      }}
    >
      <MenuItem key="language-direction-empty-menu-item" value={''} primaryText={''} />
      <MenuItem key="ltr-menu-item" value={'ltr'} primaryText={translate('project_validation.ltr')} />
      <MenuItem key="rtr-menu-item" value={'rtl'} primaryText={translate('project_validation.rtl')} />
    </SelectField>
  </div>
);

LanguageDirectionDropdownMenu.defaultProps = {
  id: 'language-direction-SelectField',
  className: 'language-irextion-select',
};

LanguageDirectionDropdownMenu.propTypes = {
  translate: PropTypes.func.isRequired,
  languageDirection: PropTypes.string.isRequired,
  updateLanguageDirection: PropTypes.func.isRequired,
  id: PropTypes.string,
  className: PropTypes.string,
};

export default LanguageDirectionDropdownMenu;
