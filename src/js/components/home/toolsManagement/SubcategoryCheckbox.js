import React from 'react';
import PropTypes from 'prop-types';
import Checkbox from '@material-ui/core/Checkbox';
import { withStyles } from '@material-ui/core/styles';

const styles = {
  root: {
    'color': 'var(--accent-color-dark)',
    '&$checked': { color: 'var(--accent-color-dark)' },
    'padding': '0px',
  },
  checked: {},
};

const SubcategoryCheckbox = ({
  classes,
  subcategory,
  toolName,
  onSubcategoryChecked,
  selectedCategories,
}) => {
  const isChecked = selectedCategories.includes(subcategory.id);

  return (
    <Checkbox
      classes={{
        root: classes.root,
        checked: classes.checked,
      }}
      checked={isChecked}
      onChange={(e) => onSubcategoryChecked(subcategory, toolName, e.target.checked)}
    />
  );
};

SubcategoryCheckbox.propTypes = {
  classes: PropTypes.object.isRequired,
  subcategory: PropTypes.object.isRequired,
  toolName: PropTypes.string.isRequired,
  onSubcategoryChecked: PropTypes.func.isRequired,
  selectedCategories: PropTypes.array.isRequired,
};

export default withStyles(styles)(SubcategoryCheckbox);
