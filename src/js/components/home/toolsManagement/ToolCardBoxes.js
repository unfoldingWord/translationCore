import React from 'react';
import PropTypes from 'prop-types';
import {Checkbox} from 'material-ui';
import {Glyphicon} from 'react-bootstrap';
//import { FileFolderShared } from 'material-ui/svg-icons';
/*
Checkboxnames are derived first by what is in Gateway language resource 
translation notes FileFolder. This is mapped to the array in 
projectDetailsReducer which determines the order of folders that exist. 
Finally it is mapped to this object to deterime categories to show the 
user
*/ 
const checkBoxNames = { // this will use translate
  'kt':       'Key Terms',
  'names':    'Names',
  'other':    'Other Terms',

  'cult':     'Cultural',
    'cult\\symAct':      'Symbolic Actions',
    'cult\\symLang':     'Symbolic Language', 
    'cult\\cultInfo':    'Cultural Information', 
    'cult\\unknown':     'Unknowns',
    'cult\\plicit':      'Implicit and Explicit Information',
  'fig':      'Figures of Speech',
    'fig\\idiom':        'Idiom',
    'fig\\irony':        'Irony',
    'fig\\rhet':         'Rhetorical Questions',
    'fig\\metaphor':     'Metaphor',
    'fig\\simile':       'Simile',
    'fig\\apos':         'Apostrophy',
    'fig\\euph':         'Euphemism',
    'fig\\hen':          'Hendiadys',
    'fig\\hyper':        'Hyperbole',
    'fig\\litotes':      'Litotes',
    'fig\\merism':       'Merism',
    'fig\\meto':         'Metonymy',
    'fig\\para':         'Parallelism',
    'fig\\person':       'Personification',
    'fig\\synec':        'Synecdoche',
    'fig\\ellipsis':     'Ellipsis',
    'fig\\neg':          'Double Negative',
  'lex':      'Lexical',
    'lex\\wgt':          'Weights and Measures',
    'lex\\num':          'Numbers',
    'lex\\frac':         'Fractions',
    'lex\\ord':          'Ordinal Numbers',

  'morph':    'Morphological',
    'morph\\you':        'Forms of You',
    'morph\\we':         'Forms of We',
    'morph\\they':       'Forms of They', 
    'morph\\actPas':     'Active or Passive', 
    'morph\\gender':     'Gender', 
    'morph\\pronouns':   'Pronounds', 
    'morph\\conj':       'Connecting Words', 
    'morph\\gen':        'Genitive', 
    'morph\\honor':      'Honorifics'
};

const ToolCardBoxes = ({checks, onChecked, selectedCategories, toolName}) => {
console.log( "ToolCardBoxes: checks", checks ); // This works
console.log( "ToolCardBoxes: onChecked", onChecked );
console.log( "ToolCardBoxes: selectedCategories", selectedCategories );
console.log( "ToolCardBoxes: toolName", toolName );

  const sortedChecks = checks.sort((a, b) => {
    return Object.keys(checkBoxNames).indexOf(a) > Object.keys(checkBoxNames).indexOf(b);
  });
  
  return (
    <div style={{marginLeft: '6%'}}>
      {
        sortedChecks.map((id, index) => (
          <div style={{display: 'flex', alignItems: 'center', marginBottom: 5}} key={index}>
            {
              id.indexOf('\\') == -1 ? (
              <React.Fragment>
                  <Checkbox
                    style={{width: 'unset'}}
                    iconStyle={{fill: 'black', marginRight: 12}}
                    checked={selectedCategories.includes(id)}
                    onCheck={(e) => {
                      onChecked(id, e.target.checked, toolName);
                    }}
                  />{checkBoxNames[id] || id}
                  {toolName == 'translationNotes' ? (
                    <Glyphicon
                     style={{float: "right", fontSize: "18px", margin: "0px 0px 0px 6px"}}
                     glyph={id.onChecked ? "chevron-up" : "chevron-down"} 
                    />) : ("")}
              </React.Fragment>
            ) : (
              <React.Fragment>
                  <Checkbox
                    style={{marginLeft: 34, width: 'unset'}}
                    iconStyle={{fill: 'black', marginRight: 12}}
                    checked={selectedCategories.includes(id)}
                    onCheck={(e) => {
                      onChecked(id, e.target.checked, toolName);
                    }}
                  />{checkBoxNames[id] || id}
              </React.Fragment>)
      }
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
