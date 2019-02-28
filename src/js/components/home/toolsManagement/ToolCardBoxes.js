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

/**
 * turn group object of category objects in to set of objects
 */
function flattenNotesCategories() {
  let checkBoxNames = {};
  let lookupNames = {};

  Object.keys(tNotesCategories).forEach( item => {
    checkBoxNames[item] = toolCardCategories[item]; 
    lookupNames[item] = 'tool_card_categories.' + item;
    Object.keys(tNotesCategories[item]).forEach(subItem => {
      const group = subItem.substr(subItem.indexOf('-') + 1);
      checkBoxNames[item + '-' + group] = tNotesCategories[item][subItem];
      lookupNames[group] = 'tool_card_categories.' + subItem.replace('-','_');
    });
  });

  Object.keys(toolCardCategories).forEach( item => {
    lookupNames[item] = 'tool_card_categories.' + item;
  });

  return [checkBoxNames, lookupNames];
}


/**
 * Display a preconfigured chechbox with passed parms
 * @param {*} selectedCategories 
 * @param {*} id 
 * @param {*} toolName 
 * @param {*} onChecked 
 */
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


/**
 * return letters after the dash
 * @param {*} symbol - token containing a dash 
 */
function postPart(symbol) {
  return symbol.substr( symbol.indexOf("-") + 1 );
}


class ToolCardBoxes extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      expanded: {}
    };

    this.showExpanded = this.showExpanded.bind(this);
  }

  componentDidMount() {
    
  }

  showExpanded(id) {
    this.setState({
      expanded: {
<<<<<<< HEAD
        ...this.state.expanded,
        [id]: !this.state.expanded[id]
      }
    });
    
    console.log("this.setState.expanded: ", this.setState.expanded );
=======
      ...this.state.expanded,
      [id]: !this.state.expanded[id]
    }});
>>>>>>> 0865cfc39bf75344a913a10979ae78657de062e5
  }

// TBD sync with new file system
//       limit to book
//       map to categories
//       change from folders to files
//       extend folder depth
//       strip extensions
//       strip prefix
//       use translate
// TBD   make checked boxes stick

  render() {  
    // Checks is DEPRECATED
    const {checks, toolName, selectedCategories, onChecked, translate} = this.props;
    const [checkBoxNames, lookupNames] = flattenNotesCategories();
    let sortedChecks = [];
//console.log("toolName: ", toolName);
//console.log("selectedCategories: ", selectedCategories );
//console.log("onChecked: ", onChecked);
console.log("checkBoxNames: ", checkBoxNames );
console.log("lookupNames: ", lookupNames );
    if (toolName !== 'translationNotes') {  
      sortedChecks = checks.sort((a, b) => {
        return Object.keys(checkBoxNames).indexOf(a) > Object.keys(checkBoxNames).indexOf(b);
      });
    } else {
      sortedChecks = Object.getOwnPropertyNames(checkBoxNames);
    }

console.log("sortedChecks: ", sortedChecks );

    return (
      <div style={{ margin: '0 2% 0 6%', border: 'thin none black' }}>
        { 
          sortedChecks.map((id, index) =>  // outer loop of categories  
            !id.includes('-') ? ( // not a sub-category
              <div style={{ display: 'flex', flexWrap: 'wrap',  border: 'thin none red', margin: '0 0 5 0', width: '100%'}} key={index}> 
                <div style={{ display: 'flex', border: 'thin none green', width: '92%'}}>      
                  <div style={{border: "thin none brown", width: '38px' }} >
                    {localCheckBox( selectedCategories, id, toolName, onChecked)}
                  </div>
                  <div style={{border: "thin none brown"}} >
                    {translate(lookupNames[id]) /* label */}
                  </div>
                </div>
                {
                  toolName === 'translationNotes' ? (
                    <React.Fragment>
                      <div style={{ border: 'thin none cyan', alignSelf: 'flex-end'}}>
                        <Glyphicon // ^ or v
                          style={{fontSize: '18px', margin: '0 12px 0 0',
                                  width: '20px', textAlign: 'right'}}
<<<<<<< HEAD
                          glyph={this.state.expanded[id] ? 'chevron-up' : 'chevron-down'}
=======
                          glyph={index.onChecked ? 'chevron-up' : 'chevron-down'}
>>>>>>> 0865cfc39bf75344a913a10979ae78657de062e5
                          onClick={() => this.showExpanded(id)}
                        />
                      </div>
                      {this.state.expanded[id] ? (
                      <div style={{display: 'flex', flexWrap: 'wrap', alignItems: 'left', 
                                   marginBottom: 5, border: 'thin none magenta', width: '100%'}} key={index}> 
                        {sortedChecks
                          .filter(iid => iid.includes( id + '-' ) ) 
                          .map((id, index) => (               
                            <div style={{display: 'flex', border: 'thin none blue', width: '48%'}} key={index} >
                              <div style={{border: "thin none orange", marginLeft: '36px', width: '38px'}} >
                                {localCheckBox( selectedCategories, postPart(id), toolName, onChecked)}</div>
                              <div style={{border: "thin none green"}} >{translate(lookupNames[postPart(id)])}</div>
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
  toolName: PropTypes.string.isRequired,
  translate: PropTypes.func.isRequired,
};

export default ToolCardBoxes;
