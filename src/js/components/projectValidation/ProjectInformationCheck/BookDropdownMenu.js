import React from 'react';
import PropTypes from 'prop-types';
// components
import { Glyphicon } from 'react-bootstrap';
import { SelectField, MenuItem } from 'material-ui';
import BooksOfTheBible from '../../../common/BooksOfTheBible';

const BookDropdownMenu = ({
  bookId,
  updateBookId
}) => {
  return (
    <div>
      <SelectField
        value={bookId}
        style={{ width: '150px' }}
        underlineFocusStyle={{ borderColor: "var(--accent-color-dark)" }}
        floatingLabelStyle={{ color: '#000' }}
        floatingLabelText={
          <div>
            <Glyphicon glyph={"book"} style={{ color: "#000000" }} />&nbsp;
            <span>Book</span>&nbsp;
            <span style={{ color: '#800020'}}>*</span>
          </div>
        }
        onChange={(event, index, value) => {
          updateBookId(value);
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

BookDropdownMenu.propTypes = {
  bookId: PropTypes.string.isRequired,
  updateBookId: PropTypes.func.isRequired
};

export default BookDropdownMenu;
