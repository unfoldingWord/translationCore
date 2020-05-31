import React from 'react';
import PropTypes from 'prop-types';
// components
import { Glyphicon } from 'react-bootstrap';
import { SelectField, MenuItem } from 'material-ui';
import complexScriptFonts from '../../../common/complexScriptFonts';

const LanguageDirectionDropdownMenu = ({
  id,
  className,
  translate,
  languageFont,
  updateLanguageFont,
}) => (
  <div
    id={id+'-wrapper'}
    className={className}
  >
    <label htmlFor={id} style={{ margin: 0 }}>
      <Glyphicon glyph={'font'} style={{ color: '#000000', fontSize: '16px' }} />&nbsp;
      <span>{translate('project_validation.language_font')}</span>&nbsp;
      <span className={'required'}/>
    </label>
    <SelectField
      id={id}
      value={languageFont || ''}
      errorText={languageFont === '' ? translate('project_validation.field_required') : null}
      errorStyle={{ color: '#cd0033' }}
      underlineFocusStyle={{ borderColor: 'var(--accent-color-dark)' }}
      onChange={(event, index, value) => {
        updateLanguageFont(value);
      }}
    >
      <MenuItem key="NotoSans-font-menu-item" value={'default'} primaryText={'Noto Sans (Default)'} />
      {
        Object.keys(complexScriptFonts).map((fontName) => {
          const value = complexScriptFonts[fontName].font;
          return <MenuItem key={`${fontName}-font-menu-item`} value={value} primaryText={fontName} />;
        })
      }
    </SelectField>
  </div>
);

LanguageDirectionDropdownMenu.defaultProps = {
  id: 'language-font-SelectField',
  className: 'language-font-select',
};

LanguageDirectionDropdownMenu.propTypes = {
  id: PropTypes.string,
  className: PropTypes.string,
  translate: PropTypes.func.isRequired,
  languageFont: PropTypes.string.isRequired,
  updateLanguageFont: PropTypes.func.isRequired,
};

export default LanguageDirectionDropdownMenu;
