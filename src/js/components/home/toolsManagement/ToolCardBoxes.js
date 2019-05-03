import React from 'react';
import PropTypes from 'prop-types';
import Checkbox from '@material-ui/core/Checkbox';
import isEqual from 'deep-equal';
import { withStyles } from '@material-ui/core/styles';
import {Glyphicon} from 'react-bootstrap';
import {tNotesCategories} from "tsv-groupdata-parser";
import * as ResourcesActions from "../../../actions/ResourcesActions";
import {parseArticleAbstract} from "../../../helpers/ToolCardHelpers";

const styles = {
  root: {
    color: 'var(--accent-color-dark)',
    '&$checked': {
      color: 'var(--accent-color-dark)',
    },
  },
  checked: {},
};
/**
*  Checkboxnames are derived first by what is in Gateway language resource
*  translation notes FileFolder. This is mapped to the array in
*  projectDetailsReducer which determines the order of folders that exist.
*  Finally it is mapped to this object to deterime category names to show the
*  user
*/
const toolCardCategories = {
  'kt': 'Key Terms',
  'names': 'Names',
  'other': 'Other Terms',

  'culture': 'Culture',
  'figures': 'Figures of Speech',
  'numbers': 'Numbers',
  'discourse': 'Discourse',
  'grammar': 'Grammar'
};

/**
 * turn group object of category objects in to set of objects
 */
function flattenNotesCategories() {
  let lookupNames = {};
  Object.keys(tNotesCategories).forEach(item => {
    lookupNames[item] = 'tool_card_categories.' + item;
    Object.keys(tNotesCategories[item]).forEach(subItem => {
      const group = subItem.substr(subItem.indexOf('-') + 1);
      lookupNames[group] = 'tool_card_categories.' + subItem;
    });
  });

  Object.keys(toolCardCategories).forEach(item => {
    lookupNames[item] = 'tool_card_categories.' + item;
  });
  return lookupNames;
}


/**
 * Display a preconfigured chechbox with passed parms
 * @param {*} selectedCategories
 * @param {*} id
 * @param {*} toolName
 * @param {*} onChecked
 */
function localCheckBox(classes, selectedCategories, id, toolName, onChecked, availableCategoriesForParent = []) {
  const isParent = !!availableCategoriesForParent.length;
  const currentCategoriesSelected = availableCategoriesForParent.filter((subcategory) => selectedCategories.includes(subcategory));
  const allChildrenSelected = isEqual(availableCategoriesForParent, currentCategoriesSelected);
  const allChildrenUnselected = currentCategoriesSelected.length === 0;
  const showIndeterminate = !allChildrenUnselected && currentCategoriesSelected.length > 0 && !allChildrenSelected;

  return (
    <Checkbox
      checked={selectedCategories.includes(id) || (isParent && allChildrenSelected)}
      indeterminate={isParent && showIndeterminate}
      classes={{
        root: classes.root,
        checked: classes.checked,
      }}
      onChange={(e) => {
        if (isParent) {
          onChecked(availableCategoriesForParent, e.target.checked, toolName);
        } else {
          onChecked(id, e.target.checked, toolName);
        }
      }}
    />
  );

  // return (
  //   <Checkbox
  //     style={{width: 'unset'}}
  //     iconStyle={{fill: 'black', margin: "0, 0, 0, 0"}}
  //     checked={selectedCategories.includes(id) || (isParent && allChildrenSelected)}
  //     onCheck={(e) => {
  //       if (isParent) {
  //         onChecked(availableCategoriesForParent, e.target.checked, toolName);
  //       } else {
  //         onChecked(id, e.target.checked, toolName);
  //       }
  //     }}
  //   />
  // );
}


/**
 * return letters after the dash
 * @param {*} symbol - token containing a dash
 */
function postPart(symbol) {
  return symbol.includes('-') ?
    symbol.substr(symbol.indexOf("-") + 1) :
    symbol;
}



class ToolCardBoxes extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      expanded: {}
    };

    this.showExpanded = this.showExpanded.bind(this);
  }


  componentWillMount() {
    this.loadArticles();
  }


  /**
   * Load first 600 characters of tA articles for available categories in this project
   */
  loadArticles(){
    let fullText = "";
    let articles = {};

    for(var cat in this.props.availableCategories) {
      let category  = this.props.availableCategories[cat];

      for(var group in category ) {
        fullText = ResourcesActions.loadArticleData(
          'translationAcademy',
          category[group],
          this.props.selectedGL
        );

        articles[category[group]] = fullText.substr(0,600) ;
      }
    }

    this.setState( {"articles": articles} );
  }


  showExpanded(id) {
    this.setState({
      expanded: {
        ...this.state.expanded,
        [id]: !this.state.expanded[id]
      }
    });
  }


  onWordClick(event, category) {
    const positionCoord = event.target;
    const fullText = this.state.articles[category];
    const [title, intro] = parseArticleAbstract(fullText);
    this.props.showPopover(title, intro, positionCoord);
  }


  render() {
    const {
      availableCategories = {},
      toolName,
      selectedCategories,
      onChecked,
      translate,
      classes,
    } = this.props;
    const lookupNames = flattenNotesCategories();
    return (
      <div style={{margin: '0 2% 0 6%'}}>
        {
          Object.keys(availableCategories).map((parentCategory, index) => {
            return availableCategories[parentCategory].length > 0 &&
              tNotesCategories[parentCategory] || toolName == 'translationWords' ?
              (
                <div style={{display: 'flex', flexWrap: 'wrap', margin: '0 0 5 0', width: '100%'}} key={index}>
                  <div style={{display: 'flex', width: '92%'}}>
                    <div style={{width: '38px'}} >
                      {localCheckBox(classes, selectedCategories, parentCategory, toolName, onChecked, availableCategories[parentCategory])}
                    </div>
                    <div>
                      {translate(lookupNames[parentCategory])   /* category label */}
                    </div>
                  </div>
                  <React.Fragment>
                    {toolName != 'translationWords' ? (
                      <div style={{alignSelf: 'flex-end'}}>
                        <Glyphicon // ^ or v
                          style={{
                            fontSize: '18px', margin: '0 12px 0 0',
                            width: '20px', textAlign: 'right'
                          }}
                          glyph={this.state.expanded[parentCategory] ? 'chevron-up' : 'chevron-down'}
                          onClick={() => this.showExpanded(parentCategory)}
                        />
                      </div>
                    ) : null
                    }
                    {this.state.expanded[parentCategory] ? (
                      <div style={{
                        display: 'flex', flexWrap: 'wrap', alignItems: 'left',
                        marginBottom: 5, width: '100%'
                      }} key={index}>
                        {availableCategories[parentCategory].map((subcategory, index) => (
                          <div style={{display: 'flex', width: '48%'}} key={index} >
                            <div style={{marginLeft: '36px', width: '38px'}}>
                              {localCheckBox(classes, selectedCategories, subcategory, toolName, onChecked)}
                            </div>
                            <span onClick={(event) => this.onWordClick(event, subcategory)}
                                style={{cursor: "pointer"}} >
                              { translate(lookupNames[postPart(subcategory)]) }
                            </span>
                          </div>
                        ))
                        }
                      </div>
                    ) : null}
                  </React.Fragment>
                </div>
              ) : null;
          })
        }
      </div>
    );
  }
}

ToolCardBoxes.propTypes = {
  availableCategories: PropTypes.object.isRequired,
  onChecked: PropTypes.func,
  selectedCategories: PropTypes.array.isRequired,
  toolName: PropTypes.string.isRequired,
  translate: PropTypes.func.isRequired,
  targetOrigin: PropTypes.string,
  selectedGL: PropTypes.string.isRequired,
  showPopover: PropTypes.func.isRequired,
  closePopover: PropTypes.func,
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ToolCardBoxes);
