import React from 'react';
import PropTypes from 'prop-types';
import {Checkbox} from 'material-ui';
import {Glyphicon} from 'react-bootstrap';
import { tNotesCategories } from "tsv-groupdata-parser";
/**
*  Checkboxnames are derived first by what is in Gateway language resource 
*  translation notes FileFolder. This is mapped to the array in 
*  projectDetailsReducer which determines the order of folders that exist. 
*  Finally it is mapped to this object to deterime category names to show the 
*  user
*/ 
/*
const flattenedNotesFolders = [
  '123person',
  'abstractnouns',    'activepassive',  'apostrophe',
  'background',       'bdistance',      'bmoney',             'bvolume',       'bweight',
  'connectingwords',
  'declarative',      'distinguish',    'doublenegatives',    'doublet',
  'ellipsis',         'endofstory',     'euphemism',          'events',        'exclamations',  'exclusive',  'exmetaphor',  'explicit',
  'fraction',
  'gendernotations',  'genericnoun',    'go',
  'hebrewmonths',     'hendiadys',      'hyperbole',          'hypo',
  'idiom',            'imperative',     'inclusive',          'intro',         'irony',
  'litotes',
  'manuscripts',      'merism',         'metaphor',           'metonymy',
  'names',            'newevent',       'nominaladj',         'numbers',
  'ordinal',
  'parables',         'parallelism',    'participants',       'pastforfuture', 'personification',  'poetry',  'possession',  'pronouns',  'proverbs',
  'quotations',       'quotesinquotes',
  'rpronouns',        'rquestion',
  'sentences',        'simile',         'sonofgodprinciples', 'symaction',     'symlanguage',  'synecdoche',
  'textvariants',     'transliterate',
  'unknown',
  'versebridge',
  'you'
];
*/
/* toolcardcategories

const tNotesCategoriesTest = {
  lexical: {
    "translate-bweight": "Measures and Weights",
    "translate-numbers": "Numbers",
    "translate-fraction": "Fractions",
    "translate-ordinal": "Ordinal Numbers"
  },
  figures: {
    "figs-idiom": "Idiom",
    "figs-irony": "Irony",
    "figs-metaphor": "Metaphor",
    "figs-rquestions": "Rhetorical Questions",
    "figs-simile": "Simile",
    "figs-apostrophe": "apostrophe",
    "figs-euphemism": "Euphemism",
    "figs-hendiadys": "Hendiadys",
    "figs-hyperbole": "Hyperbole",
    "figs-litotes": "litotes",
    "figs-merism": "Merism",
    "figs-metonymy": "Metonymy",
    "figs-parallelism": "Parallelism",
    "figs-personification": "Personification",
    "figs-synecdoche": "Synecdoche",
    "figs-ellipsis": "Ellipsis",
    "figs-doublenegatives": "Double negatives"
  },
  cultural: {
    "translate-symaction": "Symbolic Actions",
    "writing-symlanguage": "Symbolic Language",
    "translate-unknown": "Unknowns",
    "figs-explicit": "Implicit and Explicit Information"
  },
  morphological: {
    "figs-you": "Forms of You",
    "figs-we": "Forms of We",
    "figs-they": "Forms of They",
    "figs-activepassive": "Active or Passive",
    "figs-gendernotations": "Gender",
    "figs-pronouns": "Pronouns",
    "writing-connectingwords": "Connecting Words",
  }
}
*/

const toolCardCategories = {
  'kt':       'Key Terms',
  'names':    'Names',
  'other':    'Other Terms',

  'cultural':      'Cultural',
  'figures':       'Figures of Speech',
  'lexical':       'Lexical',
  'morphological': 'Morphological'
};
/*
const checkBoxName = { // this will use translate
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
      'morphological-pronouns':   'Pronouns', 
      'morphological-conj':       'Connecting Words', 
      'morphological-gen':        'Genitive', 
      'morphological-honor':      'Honorifics'
};
*/

function flattenNotesCategories() {
  let checkBoxNames = {};
console.log("tNotesCategories: ", tNotesCategories);
  Object.keys(tNotesCategories).forEach( item => {
    checkBoxNames[item] = toolCardCategories[item]; 

    Object.keys(tNotesCategories[item]).forEach(subItem => {
      const group = subItem.substr(subItem.indexOf('-') + 1);
      checkBoxNames[item + '-' + group] = tNotesCategories[item][subItem];
    });
  });
console.log("tNotesCategories: ", tNotesCategories);
  return checkBoxNames;
}


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
      expanded: {}
    };

    this.showExpanded = this.showExpanded.bind(this);
  }


  showExpanded(id) {
    this.setState({
      expanded: {
        ...this.state.expanded,
        [id]: !this.state.expanded[id]
      }
    });
    
    console.log("this.setState.expanded: ", this.setState.expanded );
  }

// TBD sync with new file system
//       limit to book
// TBD   map to categories
//       change from folders to files
//       extend folder depth
//       strip extensions
//       strip prefix
// TBD   use translate
// TBD   make checked boxes stick

  render() {  
    // Checks is DEPRECATED
    const {checks, toolName, selectedCategories, onChecked} = this.props;
    const checkBoxNames = flattenNotesCategories();
    let sortedChecks = [];
//console.log("toolName: ", toolName);
//console.log("selectedCategories: ", selectedCategories );
//console.log("onChecked: ", onChecked);
//console.log("checkBoxNames: ", checkBoxNames );

    if (toolName !== 'translationNotes') {  
      sortedChecks = checks.sort((a, b) => {
        return Object.keys(checkBoxNames).indexOf(a) > Object.keys(checkBoxNames).indexOf(b);
      });
    } else {
      sortedChecks = Object.getOwnPropertyNames(checkBoxNames);
    }

//console.log("sortedChecks: ", sortedChecks );

    return (
      <div style={{ margin: '0 2% 0 6%', border: 'thin none black' }}>
        { 
          sortedChecks.map((id, index) =>  // outer loop of categories  
            id.indexOf('-') <= -1 ? ( // not a sub-category
              <div style={{ display: 'flex', flexWrap: 'wrap',  border: 'thin none red', margin: '0 0 5 0', width: '100%'}} key={index}> 
                <div style={{ display: 'flex', border: 'thin none green', width: '92%'}}>      
                  <div style={{border: "thin none brown", width: '38px' }} >
                    {localCheckBox( selectedCategories, id, toolName, onChecked)}
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
                          glyph={this.state.expanded[id] ? 'chevron-up' : 'chevron-down'}
                          onClick={() => this.showExpanded(id)}
                        />
                      </div>
                      {this.state.expanded[id] ? (
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
