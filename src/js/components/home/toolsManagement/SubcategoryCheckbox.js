import React from 'react';
import PropTypes from 'prop-types';
import Checkbox from '@material-ui/core/Checkbox';
import { withStyles } from '@material-ui/core/styles';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import CheckBoxOutlineIcon from '@material-ui/icons/CheckBoxOutlineBlank';

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
  toolName,
  subcategory,
  selectedCategories,
  onSubcategoryChecked,
}) => {
  const isChecked = selectedCategories.includes(subcategory.id);

  return (
    <Checkbox
      checked={isChecked}
      classes={{
        root: classes.root,
        checked: classes.checked,
      }}
      icon={<CheckBoxOutlineIcon style={{ fontSize: '24px' }} />}
      checkedIcon={<CheckBoxIcon style={{ fontSize: '24px' }} />}
      onChange={(e) =>
        onSubcategoryChecked(subcategory, toolName, e.target.checked)
      }
    />
  );
};

SubcategoryCheckbox.propTypes = {
  classes: PropTypes.object.isRequired,
  toolName: PropTypes.string.isRequired,
  subcategory: PropTypes.object.isRequired,
  selectedCategories: PropTypes.array.isRequired,
  onSubcategoryChecked: PropTypes.func.isRequired,
};

export default withStyles(styles)(SubcategoryCheckbox);
