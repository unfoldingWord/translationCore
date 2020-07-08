import React from 'react';
import PropTypes from 'prop-types';
// components
import { SelectField, MenuItem } from 'material-ui';
import TextFieldsIcon from '@material-ui/icons/TextFields';
import complexScriptFonts from '../../../common/complexScriptFonts';

const iconStyle = {
  verticalAlign: 'top',
  width: 24,
  height: 24,
};

/**
 * get a sorted list all sort choices including complexScriptFonts and default
 * @return {{primaryText, value, key: string}[]} sorted list of font choices
 */
function getFontList() {
  // add all complex script fonts to font list
  const fontList = Object.keys(complexScriptFonts).map((fontName) => ({
    key: `${fontName}-font-menu-item`,
    value: complexScriptFonts[fontName].font,
    primaryText:fontName,
  }));

  // add default font
  fontList.push({
    key: 'NotoSans-font-menu-item',
    value: 'default',
    primaryText: 'Noto Sans (Default)',
  });

  // return sorted font list
  return fontList.sort((a, b) => a.primaryText < b.primaryText ? -1 : 1);
};

const ProjectFontDropdownMenu = ({
  id,
  className,
  translate,
  projectFont,
  updateProjectFont,
}) => (
  <div
    id={id+'-wrapper'}
    className={className}
  >
    <label htmlFor={id} style={{ margin: 0 }}>
      <TextFieldsIcon style={iconStyle}/>&nbsp;
      <span>{translate('project_validation.project_font')}</span>&nbsp;
      <span className={'required'}/>
    </label>
    <SelectField
      id={id}
      value={projectFont || ''}
      errorText={projectFont === '' ? translate('project_validation.field_required') : null}
      errorStyle={{ color: '#cd0033' }}
      underlineFocusStyle={{ borderColor: 'var(--accent-color-dark)' }}
      onChange={(event, index, value) => {
        updateProjectFont(value);
      }}
    >
      {
        getFontList().map((font) => <MenuItem key={font.key} value={font.value} primaryText={font.primaryText} />)
      }
    </SelectField>
  </div>
);

ProjectFontDropdownMenu.defaultProps = {
  id: 'project-font-SelectField',
  className: 'project-font-select',
};

ProjectFontDropdownMenu.propTypes = {
  id: PropTypes.string,
  className: PropTypes.string,
  translate: PropTypes.func.isRequired,
  projectFont: PropTypes.string.isRequired,
  updateProjectFont: PropTypes.func.isRequired,
};

export default ProjectFontDropdownMenu;
