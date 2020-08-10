import React from 'react';
import PropTypes from 'prop-types';
import { Glyphicon } from 'react-bootstrap';
// components
import Hint from '../../Hint';
// helpers
import { loadArticleData } from '../../../helpers/ResourcesHelpers';
import { parseArticleAbstract } from '../../../helpers/ToolCardHelpers';
import {
  flattenNotesCategories,
  hasAllNeededData,
  sortSubcategories,
} from '../../../helpers/toolCardBoxesHelpers';
// constants
import { TRANSLATION_WORDS, TRANSLATION_ACADEMY } from '../../../common/constants';
import SubcategoryCheckbox from './SubcategoryCheckbox';
import CategoryCheckbox from './CategoryCheckbox';

const styles = {
  categoriesDiv: {
    display: 'flex',
    flexWrap: 'wrap',
    margin: '0 0 5 0',
    width: '100%',
  },
  glyphicon: {
    fontSize: '18px',
    margin: '0 12px 0 0',
    width: '20px',
    textAlign: 'right',
  },
  subcategoriesDiv: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'left',
    marginBottom: 5,
    width: '100%',
  },
};

class ToolCardBoxes extends React.Component {
  constructor(props) {
    super(props);
    this.state = { expanded: {} };
    this.showExpanded = this.showExpanded.bind(this);
  }

  componentWillMount() {
    this.loadArticles();
  }

  /**
   * Load first 600 characters of tA articles for available categories in this project
   */
  loadArticles(){
    let fullText = '';
    let articles = {};
    const { availableCategories, selectedGL } = this.props;

    for (const cat in availableCategories) {
      const category = availableCategories[cat];

      for (const group in category) {
        if (group && category[group]) {
          fullText = loadArticleData(
            TRANSLATION_ACADEMY,
            category[group].id,
            selectedGL,
          );

          articles[category[group].id] = fullText.substr(0, 600);
        }
      }
    }

    this.setState({ articles });
  }

  showExpanded(id) {
    this.setState({
      expanded: {
        ...this.state.expanded,
        [id]: !this.state.expanded[id],
      },
    });
  }

  getArticleText(categoryId) {
    const fullText = this.state.articles[categoryId];
    const { title, intro } = parseArticleAbstract(fullText);
    return title + ': ' + intro;
  }

  render() {
    const {
      availableCategories = {},
      toolName,
      selectedCategories,
      translate,
      onCategoryChecked,
      onSubcategoryChecked,
    } = this.props;
    const lookupNames = flattenNotesCategories();

    return (
      <div style={{ margin: '0 2% 0 6%' }}>
        {
          Object.keys(availableCategories).map((parentCategory, index) => {
            const subcategories = availableCategories[parentCategory];
            // use other_terms as parentCategory for the category 'other' for translationWords tool
            parentCategory = parentCategory === 'other' && toolName === TRANSLATION_WORDS ? 'other_terms' : parentCategory;

            if (hasAllNeededData(toolName, parentCategory, subcategories, lookupNames)) {
              return (
                <div key={index} style={styles.categoriesDiv}>
                  <div style={{ display: 'flex', width: '92%' }}>
                    <div style={{ width: '38px' }}>
                      <CategoryCheckbox
                        toolName={toolName}
                        onCategoryChecked={onCategoryChecked}
                        selectedCategories={selectedCategories}
                        availableSubcategories={subcategories}
                      />
                    </div>
                    <div>
                      {/* category label */translate(lookupNames[parentCategory])}
                    </div>
                  </div>
                  <React.Fragment>
                    {toolName !== TRANSLATION_WORDS &&
                      <div style={{ alignSelf: 'flex-end' }}>
                        <Glyphicon
                          style={styles.glyphicon}
                          glyph={this.state.expanded[parentCategory] ? 'chevron-up' : 'chevron-down'}
                          onClick={() => this.showExpanded(parentCategory)}
                        />
                      </div>
                    }
                    {this.state.expanded[parentCategory] && (
                      <div key={index} style={styles.subcategoriesDiv}>
                        {sortSubcategories(subcategories).map((subcategory, index) => (
                          <div key={index} style={{ display: 'flex', width: '48%' }}>
                            <div style={{ marginLeft: '36px', marginRight: '10px' }}>
                              <SubcategoryCheckbox
                                subcategory={subcategory}
                                toolName={toolName}
                                onSubcategoryChecked={onSubcategoryChecked}
                                selectedCategories={selectedCategories}
                              />
                            </div>
                            <Hint position={((index % 2) === 1) ? 'top-left' : 'top-right'} label={this.getArticleText(subcategory.id)} size={'large'}>
                              <div style={{ cursor: 'pointer' }} >
                                {subcategory.name}
                              </div>
                            </Hint>
                          </div>
                        ))
                        }
                      </div>
                    )}
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
  onCategoryChecked: PropTypes.func.isRequired,
  onSubcategoryChecked: PropTypes.func.isRequired,
  selectedCategories: PropTypes.array.isRequired,
  toolName: PropTypes.string.isRequired,
  translate: PropTypes.func.isRequired,
  targetOrigin: PropTypes.string,
  selectedGL: PropTypes.string.isRequired,
};

export default ToolCardBoxes;
