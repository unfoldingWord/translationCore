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
        style={{ width: '200px', marginTop: bookId === "" ? '30px' : '' }}
        errorText={bookId === "" ? "This field is required." : null}
        errorStyle={{ color: '#cd0033' }}
        underlineFocusStyle={{ borderColor: "var(--accent-color-dark)" }}
        floatingLabelFixed={true}
        floatingLabelStyle={{ color: '#000', fontSize: '22px', fontWeight: 'bold' }}
        floatingLabelText={
          <div>
            <Glyphicon glyph={"book"} style={{ color: "#000000", fontSize: '22px' }} />&nbsp;
            <span>Book</span>&nbsp;
            <span style={{ color: '#cd0033'}}>*</span>
          </div>
        }
        onChange={(event, index, value) => {
          updateBookId(value);
        }}
      >
      <MenuItem value={""} primaryText={""} />
      {
        Object.keys(BooksOfTheBible.newTestament).map((key, index) => {
          const BookName = BooksOfTheBible.newTestament[key] + ` (${key})`;
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
