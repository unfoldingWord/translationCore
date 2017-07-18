import React from 'react';
import PropTypes from 'prop-types';
import { SelectField, MenuItem } from 'material-ui';
import BooksOfTheBible from './BooksOfTheBible';

const BookDropDownMenu = ({
  dropDownMenuValue,
  searchReposByQuery
}) => {
  return (
    <div>
      <SelectField
        floatingLabelText="Book"
        value={dropDownMenuValue}
        onChange={(event, index, value) => {
          searchReposByQuery(value);
        }}
      >
      <MenuItem value={""} primaryText={""} />
      {
        Object.keys(BooksOfTheBible.newTestament).map((key, index) => {
          const BookName = BooksOfTheBible.newTestament[key];
          return (
            <MenuItem key={index} value={key} primaryText={BookName} />
          );
        })
      }
      </SelectField>
    </div>
  );
}

BookDropDownMenu.propTypes = {
  dropDownMenuValue: PropTypes.string.isRequired,
  searchReposByQuery: PropTypes.func.isRequired
};

export default BookDropDownMenu;
