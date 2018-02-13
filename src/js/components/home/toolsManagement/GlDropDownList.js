import React from 'react';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import PropTypes from 'prop-types';

const GLitems = ["", "English", "Hindi"];
const GLs = [];

for (let i = 0; i < GLitems.length; i++) {
  const primaryText= <span style={{ height: '18px'}}>{`${GLitems[i]}`}</span>;
  GLs.push(<MenuItem value={i} key={i} primaryText={primaryText} />);
}

/**
 * With the `maxHeight` property set, the Select Field will be scrollable
 * if the number of items causes the height to exceed this limit.
 */
const GlDropDownList = ({
  currentGLSelection,
  selectionChange,
  translate
}) => {
  return (
    <SelectField
      floatingLabelText={translate('home.tools.gateway_language')}
      floatingLabelStyle={{ color: '#000000' }}
      value={currentGLSelection}
      onChange={ (event, index, value) => selectionChange(value) }
      maxHeight={150}
      id='glddl'
    >
      {GLs}
    </SelectField>
  );
};

GlDropDownList.propTypes = {
  currentGLSelection: PropTypes.number.isRequired,
  selectionChange: PropTypes.func.isRequired,
  translate: PropTypes.func.isRequired
};

export default GlDropDownList;
