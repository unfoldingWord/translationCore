import React from 'react';
import PropTypes from 'prop-types';
import {Checkbox} from 'material-ui';

const checkBoxNames = { // this will use translate
  'kt':       'Key Terms',
  'names':    'Names',
  'other':    'Other Terms',
  
  'lex':      'Lexical',
    'wgt':      'Weights and Measures',
    'num':      'Numbers',
    'frac':     'Fractions',
    'ord':      'Ordinal Numbers',
  'fig':      'Figures of Speech',
    'idiom':    'Idiom',
    'irony':    'Irony',
    'rhet':     'Rhetorical Questions',
    'metaphor': 'Metaphor',
    'simile':   'Simile',
  'cult':     'Cultural',
    'sym':      'Symbolic Language', 
  'morph':    'Morphological',
    'you':    'Forms of You',
    'we':     'Forms of We'
};

const ToolCardBoxes = ({checks, onChecked, selectedCategories, toolName}) => {
console.log( "checks", checks ); // This works
console.log( "onChecked", onChecked );
console.log( "selectedCategories", selectedCategories );
console.log( "toolName", toolName );

  const sortedChecks = checks.sort((a, b) => {
    return Object.keys(checkBoxNames).indexOf(a) > Object.keys(checkBoxNames).indexOf(b);
  });
  
  return (
    <div style={{marginLeft: '6%'}}>
      {
        sortedChecks.map((id, index) => (
          <div style={{display: 'flex', alignItems: 'center', marginBottom: 5}} key={index}>
            <Checkbox
              style={{width: 'unset'}}
              iconStyle={{fill: 'black', marginRight: 12}}
              checked={selectedCategories.includes(id)}
              onCheck={(e) => {
                onChecked(id, e.target.checked, toolName);
              }}
            />

            <div>{checkBoxNames[id] || id}</div>
          </div>
        ))
      }
    </div>
  );
};

ToolCardBoxes.propTypes = {
  checks: PropTypes.array.isRequired,
  onChecked: PropTypes.func,
  selectedCategories: PropTypes.array.isRequired,
  toolName: PropTypes.string.isRequired
};

export default ToolCardBoxes;
