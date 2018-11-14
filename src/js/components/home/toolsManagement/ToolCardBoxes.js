import React from 'react';
import PropTypes from 'prop-types';
import {Checkbox} from 'material-ui';

const ToolCardBoxes = ({checks, onChecked}) => {
  return (
    <div style={{marginLeft: '6%'}}>
      {
        checks.map(({name, enabled}, index) => (
          <div style={{display: 'flex', alignItems: 'center', marginBottom: 5}} key={index}>
            <Checkbox
              style={{width: 'unset'}}
              iconStyle={{fill: 'black', marginRight: 12}}
              checked={enabled}
              onCheck={(e) => {
                onChecked(index, e.target.checked);
              }}
            />
            <div>{name}</div>
          </div>
        ))
      }
    </div>
  );
};

ToolCardBoxes.propTypes = {
  checks: PropTypes.array.isRequired,
  onChecked: PropTypes.func
};

export default ToolCardBoxes;
