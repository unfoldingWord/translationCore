import React from 'react';
import PropTypes from 'prop-types';
import { SelectField, MenuItem } from 'material-ui';
import * as BooksOfTheBible from '../../../../common/BooksOfTheBible';
import { getBookTranslation } from '../../../../helpers/localizationHelpers';

const BookDropdownMenu = ({
  bookIdValue,
  updateBookIdValue,
  translate
}) => {
  const allBooks = BooksOfTheBible.getAllBibleBooks();
  return (
    <div>
      <SelectField
        floatingLabelText={translate('projects.book')}
        value={bookIdValue}
        onChange={(event, index, value) => {
          updateBookIdValue(value);
        }}
      >
      <MenuItem value={""} primaryText={""} />
      {
        Object.keys(allBooks).map((key, index) => {
          const BookName = allBooks[key];
          const BookNameLocalized = getBookTranslation(translate, BookName, key);
          return (
            <MenuItem key={index} value={key} primaryText={BookNameLocalized} />
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
