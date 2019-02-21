import React from 'react';
<<<<<<< HEAD
//import { render } from 'react-dom';
=======
import {render} from 'react-dom';
>>>>>>> 340ceaddbd123bb2451fb6da8e04acc00127cabc
import PropTypes from 'prop-types';
import {Checkbox} from 'material-ui';
import {Glyphicon} from 'react-bootstrap';
import { relative } from 'path';
//import RenderToLayer from 'material-ui/internal/RenderToLayer';
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

    'cultural':      'Cultural',
      'cultural-symAct':      'Symbolic Actions',
      'cultural-symLang':     'Symbolic Language', 
      'cultural-cultInfo':    'cultural Information', 
      'cultural-unknown':     'Unknowns',
      'cultural-plicit':      'Implicit and Explicit Information',
    'figures':       'Figures of Speech',
      'figures-idiom':        'Idiom',
      'figures-irony':        'Irony',
      'figures-rhet':         'Rhetorical Questions',
      'figures-metaphor':     'Metaphor',
      'figures-simile':       'Simile',
      'figures-apos':         'Apostrophy',
      'figures-euph':         'Euphemism',
      'figures-hen':          'Hendiadys',
      'figures-hyper':        'Hyperbole',
      'figures-litotes':      'Litotes',
      'figures-merism':       'Merism',
      'figures-meto':         'Metonymy',
      'figures-para':         'Parallelism',
      'figures-person':       'Personification',
      'figures-synec':        'Synecdoche',
      'figures-ellipsis':     'Ellipsis',
      'figures-neg':          'Double Negative',
    'lexical':       'Lexical',
      'lexical-wgt':          'Weights and Measures',
      'lexical-num':          'Numbers',
      'lexical-frac':         'Fractions',
      'lexical-ord':          'Ordinal Numbers',

    'morphological': 'Morphological',
      'morphological-you':        'Forms of You',
      'morphological-we':         'Forms of We',
      'morphological-they':       'Forms of They', 
      'morphological-actPas':     'Active or Passive', 
      'morphological-gender':     'Gender', 
      'morphological-pronouns':   'Pronounds', 
      'morphological-conj':       'Connecting Words', 
      'morphological-gen':        'Genitive', 
      'morphological-honor':      'Honorifics'
};


function localCheckBox(selectedCategories, id, toolName, onChecked) {
  return (
    <Checkbox
      style={{width: 'unset'}}
      iconStyle={{fill: 'black', margin: "0, 0, 0, 0" }}
      checked={selectedCategories.includes(id)}
      onCheck={(e) => {
        onChecked(id, e.target.checked, toolName);
      }}
    />
  );
}


class ToolCardBoxes extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      expand: false
    };
    this.showExpanded = this.showExpanded.bind(this);
  }


  showExpanded() {
    this.setState({expand: !this.state.expand});
  }


  render() {  
    const {checks, toolName, selectedCategories, onChecked} = this.props;
    let sortedChecks = checks;
  console.log("checks: ",checks );
  console.log("toolName: ", toolName);
  console.log("selectedCategories: ",selectedCategories );
  console.log("onChecked: ", onChecked);

    if (toolName !== 'translationNotes') {  
      sortedChecks = checks.sort((a, b) => {
        return Object.keys(checkBoxNames).indexOf(a) > Object.keys(checkBoxNames).indexOf(b);
      });
    }

    return (
      <div style={{ margin: '0 2% 0 6%', border: 'thin none black', overflow: 'hidden' }}>
        { 
          sortedChecks.map((id, index) =>  // outer loop of categories  
            id.indexOf('-') <= -1 ? ( // not a sub-category
              <div style={{ display: 'flex', flexWrap: 'wrap', margin: '0 0 5 0', width: '100%'}} key={index}> 
                <div style={{ display: 'flex', border: 'thin none green', width: '92%'}}>      
                  <div style={{border: "thin none brown", width: '38px' }} >
                    {localCheckBox( selectedCategories, index, toolName, onChecked)}
                  </div>
                  <div style={{border: "thin none brown"}} >
                    {checkBoxNames[id] || id /* label */}
                  </div>
                </div>
                {
                  toolName === 'translationNotes' ? (
                    <React.Fragment>
                      <div style={{ border: 'thin none cyan', alignSelf: 'flex-end'}}>
                        <Glyphicon // ^ or v
                          style={{fontSize: '18px', margin: '0 12px 0 0',
                                  width: '20px', textAlign: 'right'}}
                          glyph={index.onChecked ? 'chevron-up' : 'chevron-down'}
                          onClick={this.showExpanded}
                        />
                      </div>
                      {this.state.expand ? (
                      <div style={{display: 'flex', flexWrap: 'wrap', alignItems: 'left', 
                                  marginBottom: 5, border: 'thin none magenta', width: '100%'}} key={index}> 
                        {sortedChecks
                          .filter(iid => iid.indexOf( id + '-' ) >= 0 )
                          .map((id, index) => (               
                            <div style={{display: 'flex', border: 'thin none blue', width: '48%'}} key={index} >
                              <div style={{border: "thin none orange", marginLeft: '36px', width: '38px'}} >
                                {localCheckBox( selectedCategories, id, toolName, onChecked)}</div>
                              <div style={{border: "thin none green"}} >{checkBoxNames[id] || id}</div>
                            </div>
                          ))
                        }
                      </div>
                      ): null }
                      </React.Fragment>
                  ):("") 
                }
              </div> 
            ) : ("")
          )
        }         
      </div>
    );
  }
}

ToolCardBoxes.propTypes = {
  checks: PropTypes.array.isRequired,
  onChecked: PropTypes.func,
  selectedCategories: PropTypes.array.isRequired,
  toolName: PropTypes.string.isRequired
};

export default ToolCardBoxes;
