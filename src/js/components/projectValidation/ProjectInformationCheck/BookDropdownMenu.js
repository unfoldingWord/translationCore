import React from 'react';
import PropTypes from 'prop-types';
// components
import { Glyphicon } from 'react-bootstrap';
import { SelectField, MenuItem } from 'material-ui';
import * as BooksOfTheBible from '../../../common/BooksOfTheBible';

const BookDropdownMenu = ({
  bookId,
  updateBookId,
  translate,
  id,
  className,
}) => {
  const bibleBooks = BooksOfTheBible.getAllBibleBooks(translate);
  return (
    <div
      id={id+'-wrapper'}
      className={className}
    >
      <label htmlFor={id} style={{ margin: 0 }}>
        <Glyphicon glyph={'book'} style={{ color: '#000000', fontSize: '16px' }} />&nbsp;
        <span>{translate('projects.book')}</span>&nbsp;
        <span className={'required'}/>
      </label>
      <SelectField
        id={id}
        value={bookId}
        errorText={bookId === '' ? translate('project_validation.field_required') : null}
        errorStyle={{ color: '#cd0033' }}
        underlineFocusStyle={{ borderColor: 'var(--accent-color-dark)' }}
        onChange={(event, index, value) => {
          updateBookId(value);
        }}
      >
        <MenuItem key="empty-menu-item" value={''} primaryText={''} />
        {
          Object.keys(bibleBooks).map((key, index) => {
            const BookName = bibleBooks[key];
            return (
              <MenuItem key={index.toString() + BookName} value={key} primaryText={BookName} />
            );
          })
        }
      </SelectField>
    </div>
  );
};

BookDropdownMenu.defaultProps = {
  id: 'book-dropdown-menu-selectField',
  className: 'book-dropdown-menu-select',
};

BookDropdownMenu.propTypes = {
  bookId: PropTypes.string.isRequired,
  updateBookId: PropTypes.func.isRequired,
  translate: PropTypes.func.isRequired,
  developerMode: PropTypes.bool.isRequired,
  id: PropTypes.string,
  className: PropTypes.string,
};

export default BookDropdownMenu;
