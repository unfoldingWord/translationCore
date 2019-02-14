import React from 'react';
import {render} from 'react-dom';
import PropTypes from 'prop-types';
import {Checkbox} from 'material-ui';
import {Glyphicon} from 'react-bootstrap';
import RenderToLayer from 'material-ui/internal/RenderToLayer';
//import { FileFolderShared } from 'material-ui/svg-icons';
/*
Checkboxnames are derived first by what is in Gateway language resource 
translation notes FileFolder. This is mapped to the array in 
projectDetailsReducer which determines the order of folders that exist. 
Finally it is mapped to this object to deterime categories to show the 
user
*/
const checkBoxNames = { // this will use translate
  'kt': 'Key Terms',
  'names': 'Names',
  'other': 'Other Terms',

  'cultural': 'Cultural',
  'cultural-symAct': 'Symbolic Actions',
  'cultural-symLang': 'Symbolic Language',
  'cultural-cultInfo': 'cultural Information',
  'cultural-unknown': 'Unknowns',
  'cultural-plicit': 'Implicit and Explicit Information',
  'figures': 'Figures of Speech',
  'figures-idiom': 'Idiom',
  'figures-irony': 'Irony',
  'figures-rhet': 'Rhetorical Questions',
  'figures-metaphor': 'Metaphor',
  'figures-simile': 'Simile',
  'figures-apos': 'Apostrophy',
  'figures-euph': 'Euphemism',
  'figures-hen': 'Hendiadys',
  'figures-hyper': 'Hyperbole',
  'figures-litotes': 'Litotes',
  'figures-merism': 'Merism',
  'figures-meto': 'Metonymy',
  'figures-para': 'Parallelism',
  'figures-person': 'Personification',
  'figures-synec': 'Synecdoche',
  'figures-ellipsis': 'Ellipsis',
  'figures-neg': 'Double Negative',
  'lexical': 'Lexical',
  'lexical-wgt': 'Weights and Measures',
  'lexical-num': 'Numbers',
  'lexical-frac': 'Fractions',
  'lexical-ord': 'Ordinal Numbers',

  'morphological': 'Morphological',
  'morphological-you': 'Forms of You',
  'morphological-we': 'Forms of We',
  'morphological-they': 'Forms of They',
  'morphological-actPas': 'Active or Passive',
  'morphological-gender': 'Gender',
  'morphological-pronouns': 'Pronounds',
  'morphological-conj': 'Connecting Words',
  'morphological-gen': 'Genitive',
  'morphological-honor': 'Honorifics'
};

class ToolCardBoxes extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      expand: false
    };
  }

  showExpanded() {
    this.setState({expand: !this.state.expand});
  }



  render() {
    const {checks, toolName, selectedCategories, onChecked} = this.props;
    let sortedChecks = checks;
    if (toolName !== 'translationNotes') {
      sortedChecks = checks.sort((a, b) => {
        return Object.keys(checkBoxNames).indexOf(a) > Object.keys(checkBoxNames).indexOf(b);
      });
    }
    return (
      <div style={{marginLeft: '6%'}}>
        {
          sortedChecks.map((id, index) => (
            <div style={{display: 'flex', alignItems: 'center', marginBottom: 5}} key={index}>
              {id.indexOf('-') == -1 ? (
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
                    <React.Fragment>
                      <Glyphicon
                        style={{float: "right", fontSize: "18px", margin: "0px 0px 0px 6px"}}
                        glyph={id.onChecked ? "chevron-up" : "chevron-down"}
                      />
                      <div className='subCategory'></div>
                    </React.Fragment>
                  ) : ("")}
                </React.Fragment>
              ) : (

                  <div data-toggle={id.split('-')[1]}>
                    <Checkbox
                      style={{marginLeft: 34, width: 'unset'}}
                      iconStyle={{fill: 'black', marginRight: 12}}
                      checked={selectedCategories.includes(id)}
                      onCheck={(e) => {
                        onChecked(id, e.target.checked, toolName);
                      }}
                    />{checkBoxNames[id] || id}
                  </div>
                )
              }
            </div>
          ))
        }
      </div>
    );
  }
};

ToolCardBoxes.propTypes = {
  checks: PropTypes.array.isRequired,
  onChecked: PropTypes.func,
  selectedCategories: PropTypes.array.isRequired,
  toolName: PropTypes.string.isRequired
};

export default ToolCardBoxes;
