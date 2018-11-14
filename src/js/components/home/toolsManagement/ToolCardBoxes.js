import React from 'react';
import PropTypes from 'prop-types';
import {Checkbox} from 'material-ui';
const checkBoxNames = {
  'kt':'Key Terms',
  'other': 'Other Terms',
  'names': 'Names'
};

const ToolCardBoxes = ({checks, onChecked, selectedCategories}) => {
  return (
    <div style={{marginLeft: '6%'}}>
      {
        checks.map((id, index) => (
          <div style={{display: 'flex', alignItems: 'center', marginBottom: 5}} key={index}>
            <Checkbox
              style={{width: 'unset'}}
              iconStyle={{fill: 'black', marginRight: 12}}
              checked={selectedCategories.includes(id)}
              onCheck={(e) => {
                onChecked(id, e.target.checked);
              }}
            />
            <div>{checkBoxNames[id]}</div>
          </div>
        ))
      }
    </div>
  );
};

ToolCardBoxes.propTypes = {
  checks: PropTypes.array.isRequired,
  onChecked: PropTypes.func,
  selectedCategories: PropTypes.array.isRequired
};

export default ToolCardBoxes;
