import React from 'react';
import PropTypes from 'prop-types';
import { SelectField, MenuItem } from 'material-ui';
import BooksOfTheBible from '../../../../common/BooksOfTheBible';

const BookDropdownMenu = ({
  bookIdValue,
  updateBookIdValue,
  translate
}) => {
  return (
    <div>
      <SelectField
        floatingLabelText={translate('book')}
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
};

BookDropdownMenu.propTypes = {
  translate: PropTypes.func.isRequired,
  bookIdValue: PropTypes.string.isRequired,
  updateBookIdValue: PropTypes.func.isRequired
};

export default BookDropdownMenu;
