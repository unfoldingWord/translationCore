import React from 'react';
import PropTypes from 'prop-types';
import { SelectField, MenuItem } from 'material-ui';
import * as BooksOfTheBible from '../../../../common/BooksOfTheBible';

const BookDropdownMenu = ({
  bookIdValue,
  updateBookIdValue,
  translate,
}) => {
  const allBooks = BooksOfTheBible.getAllBibleBooks(translate);
  return (
    <div>
      <SelectField
        value={bookIdValue}
        onChange={(event, index, value) => {
          updateBookIdValue(value);
        }}
        floatingLabelText={translate('projects.book')}
        floatingLabelStyle={{
          color: 'var(--text-color-dark)', opacity: '0.3', fontWeight: '500',
        }}
        underlineFocusStyle={{ borderColor: 'var(--accent-color-dark)' }}
      >
        <MenuItem value={''} primaryText={''} />
        {
          Object.keys(allBooks).map((key, index) => {
            const BookName = allBooks[key];
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
  updateBookIdValue: PropTypes.func.isRequired,
};

export default BookDropdownMenu;
