import React from 'react';
import PropTypes from 'prop-types';
import { SelectField, MenuItem } from 'material-ui';
import BooksOfTheBible from './BooksOfTheBible';

const BookDropDownMenu = ({
  bookIdValue,
  updateBookIdValue
}) => {
  return (
    <div>
      <SelectField
        floatingLabelText="Book"
        value={bookIdValue}
        onChange={(event, index, value) => {
          updateBookIdValue(value);
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
  bookIdValue: PropTypes.string.isRequired,
  updateBookIdValue: PropTypes.func.isRequired
};

export default BookDropDownMenu;
