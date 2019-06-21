import React from 'react';
import PropTypes from 'prop-types';
import Checkbox from '@material-ui/core/Checkbox';
import isEqual from 'deep-equal';
import { withStyles } from '@material-ui/core/styles';
import {Glyphicon} from 'react-bootstrap';
import {tNotesCategories} from "tsv-groupdata-parser";
import * as ResourcesActions from "../../../actions/ResourcesActions";
import {parseArticleAbstract} from "../../../helpers/ToolCardHelpers";
import Hint from "../../Hint";
import { toolCardCategories } from '../../../common/constants';

const styles = {
  root: {
    color: 'var(--accent-color-dark)',
    '&$checked': {
      color: 'var(--accent-color-dark)',
    },
    padding: '0px',
  },
  checked: {},
};

/**
 * turn group object of category objects into set of objects
 */
function flattenNotesCategories() {
  let lookupNames = {};
  Object.keys(tNotesCategories).forEach(item => {
    lookupNames[item] = 'tool_card_categories.' + item;
    Object.keys(tNotesCategories[item]).forEach(subItem => {
      lookupNames[subItem] = 'tool_card_categories.' + subItem;
    });
  });

  Object.keys(toolCardCategories).forEach(item => {
    lookupNames[item] = 'tool_card_categories.' + item;
  });
  return lookupNames;
}


/**
 * Display a preconfigured checkbox with passed params
 * @param {*} selectedCategories
 * @param {*} id
 * @param {*} toolName
 * @param {*} onChecked
 */
function localCheckBox(classes, selectedCategories, id, toolName, onChecked, availableSubcategories = []) {
  const isParent = !!availableSubcategories.length;
  const currentCategoriesSelected = availableSubcategories.filter((subcategory) => selectedCategories.includes(subcategory));
  const allChildrenSelected = isEqual(availableSubcategories, currentCategoriesSelected);
  const allChildrenUnselected = currentCategoriesSelected.length === 0;
  const showIndeterminate = !allChildrenUnselected && currentCategoriesSelected.length > 0 && !allChildrenSelected;

  return (
    <Checkbox
      checked={selectedCategories.includes(id) || (isParent && allChildrenSelected)}
      indeterminate={isParent && showIndeterminate && toolName !== 'translationWords'}
      classes={{
        root: classes.root,
        checked: classes.checked,
      }}
      onChange={(e) => {
        if (isParent) {
          onChecked(availableSubcategories, e.target.checked, toolName);
        } else {
          onChecked(id, e.target.checked, toolName);
        }
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
      const category = this.props.availableCategories[cat];

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

  getArticleText(category) {
    const fullText = this.state.articles[category];
    const {title, intro} = parseArticleAbstract(fullText);
    return title + ": " + intro;
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
            const subcategories = availableCategories[parentCategory];
            // use other_terms as parentCategory for the othet category for translationWords tool
            parentCategory = parentCategory === 'other' && toolName == 'translationWords' ?
              'other_terms' : parentCategory;
            const hasAllNeededData = !!lookupNames[parentCategory] && subcategories.length > 0 &&
              (tNotesCategories[parentCategory] || toolName === 'translationWords');

            if (hasAllNeededData) {
              return (
                <div style={{display: 'flex', flexWrap: 'wrap', margin: '0 0 5 0', width: '100%'}} key={index}>
                  <div style={{display: 'flex', width: '92%'}}>
                    <div style={{width: '38px'}} >
                      {localCheckBox(classes, selectedCategories, parentCategory, toolName, onChecked, subcategories)}
                    </div>
                    <div>
                      {translate(lookupNames[parentCategory])   /* category label */}
                    </div>
                  </div>
                  <React.Fragment>
                    {toolName !== 'translationWords' ? (
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
                        {subcategories.sort((a, b) => {
                          a = translate(lookupNames[a]);
                          b = translate(lookupNames[b]);
                          if (a < b) return -1;
                          else if (a > b) return 1;
                          return 0;
                        }).map((subcategory, index) => (
                          <div style={{display: 'flex', width: '48%'}} key={index} >
                            <div style={{marginLeft: '36px', marginRight: '10px'}}>
                              {localCheckBox(classes, selectedCategories, subcategory, toolName, onChecked)}
                            </div>
                            <Hint position={((index % 2) === 1) ? 'top-left' : 'top-right'} label={this.getArticleText(subcategory)} size={'large'}>
                              <div style={{cursor: "pointer"}} >
                                {translate(lookupNames[subcategory])}
                              </div>
                            </Hint>
                          </div>
                        ))
                        }
                      </div>
                    ) : null}
                  </React.Fragment>
                </div>
              );
            } else {
              return null;
            }
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
