import React from 'react';
import PropTypes from 'prop-types';
// components
import { Glyphicon } from 'react-bootstrap';
import { SelectField, MenuItem } from 'material-ui';
import complexScriptFonts from '../../../common/complexScriptFonts';

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
      <Glyphicon glyph={'font'} style={{ color: '#000000', fontSize: '16px' }} />&nbsp;
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
