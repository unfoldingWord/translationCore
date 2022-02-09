import React from 'react';
import PropTypes from 'prop-types';
import isEqual from 'deep-equal';
import Checkbox from '@material-ui/core/Checkbox';
import { withStyles } from '@material-ui/core/styles';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import CheckBoxOutlineIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import IndeterminateCheckBoxIcon from '@material-ui/icons/IndeterminateCheckBox';
// constants
import { TRANSLATION_WORDS } from '../../../common/constants';

const styles = {
  root: {
    'color': 'var(--accent-color-dark)',
    '&$checked': { color: 'var(--accent-color-dark)' },
    'padding': '0px',
  },
  checked: {},
};

/**
 * determine if category is checked (everything selected) or indeterminate (some selected)
 * @param availableSubcategories
 * @param selectedCategories
 * @param toolName
 * @return {{isChecked: (*|boolean), isIndeterminate: boolean}}
 */
export function getCheckStateForCategory(availableSubcategories, selectedCategories, toolName) {
  const currentSubcategoriesSelected = availableSubcategories.filter((subcat) => subcat && selectedCategories.includes(subcat.id));
  const allSubcategoriesSelected = isEqual(availableSubcategories, currentSubcategoriesSelected);
  const allSubcategoriesUnselected = currentSubcategoriesSelected.length === 0;
  const isChecked = allSubcategoriesSelected;
  const isIndeterminate = !allSubcategoriesUnselected && currentSubcategoriesSelected.length > 0 && !allSubcategoriesSelected && toolName !== TRANSLATION_WORDS;
  return { isChecked, isIndeterminate };
}

const CategoryCheckbox = ({
  classes,
  toolName,
  onCategoryChecked,
  selectedCategories,
  availableSubcategories = [],
}) => {
  const { isChecked, isIndeterminate } = getCheckStateForCategory(availableSubcategories, selectedCategories, toolName);

  return (
    <Checkbox
      checked={isChecked}
      indeterminate={isIndeterminate}
      classes={{
        root: classes.root,
        checked: classes.checked,
      }}
      icon={<CheckBoxOutlineIcon style={{ fontSize: '24px' }} />}
      checkedIcon={<CheckBoxIcon style={{ fontSize: '24px' }} />}
      indeterminateIcon={<IndeterminateCheckBoxIcon style={{ fontSize: '24px' }} />}
      onChange={(e) => onCategoryChecked(toolName, e.target.checked, availableSubcategories.map(cat => cat.id))}
    />
  );
};

CategoryCheckbox.propTypes = {
  classes: PropTypes.object.isRequired,
  toolName: PropTypes.string.isRequired,
  onCategoryChecked: PropTypes.func.isRequired,
  selectedCategories: PropTypes.array.isRequired,
  availableSubcategories: PropTypes.array.isRequired,
};

export default withStyles(styles)(CategoryCheckbox);
