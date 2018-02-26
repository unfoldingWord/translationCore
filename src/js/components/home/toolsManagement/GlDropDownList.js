import React from 'react';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import PropTypes from 'prop-types';
import { getGatewayLanguageList, DEFAULT_GATEWAY_LANGUAGE } from '../../../helpers/LanguageHelpers';

/**
 * With the `maxHeight` property set, the Select Field will be scrollable
 * if the number of items causes the height to exceed this limit.
 */
const GlDropDownList = ({
  selectedGL,
  selectionChange,
  translate
}) => {
  const GLs = [];
  getGatewayLanguageList().forEach(item => {
    const primaryText= <span style={{ height: '18px'}}>{`${item['name']}`}</span>;
    GLs.push(<MenuItem value={item['lc']} key={item['lc']} primaryText={primaryText} />);
  });
  if (!selectedGL) {
    selectedGL = DEFAULT_GATEWAY_LANGUAGE; 
  }
  return (
    <SelectField
      floatingLabelText={translate('home.tools.gateway_language')}
      floatingLabelStyle={{ color: '#000000' }}
      value={selectedGL}
      onChange={ (event, index, value) => selectionChange(value) }
      maxHeight={150}
      id='glddl'
    >
      {GLs}
    </SelectField>
  );
};

GlDropDownList.propTypes = {
  selectedGL: PropTypes.string,
  selectionChange: PropTypes.func.isRequired,
  translate: PropTypes.func.isRequired
};

export default GlDropDownList;
