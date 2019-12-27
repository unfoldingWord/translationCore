import React from 'react';
import PropTypes from 'prop-types';
import isEqual from 'deep-equal';
import Checkbox from '@material-ui/core/Checkbox';
import { withStyles } from '@material-ui/core/styles';
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

const CategoryCheckbox = ({
  classes,
  toolName,
  onCategoryChecked,
  selectedCategories,
  availableSubcategories = [],
}) => {
  const currentSubcategoriesSelected = availableSubcategories.filter((subcat) => selectedCategories.includes(subcat.id));
  const allSubcategoriesSelected = isEqual(availableSubcategories, currentSubcategoriesSelected);
  const allSubcategoriesUnselected = currentSubcategoriesSelected.length === 0;
  const isChecked = allSubcategoriesSelected;
  const isIndeterminate = !allSubcategoriesUnselected && currentSubcategoriesSelected.length > 0 && !allSubcategoriesSelected && toolName !== TRANSLATION_WORDS;

  return (
    <Checkbox
      classes={{
        root: classes.root,
        checked: classes.checked,
      }}
      checked={isChecked}
      indeterminate={isIndeterminate}
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
