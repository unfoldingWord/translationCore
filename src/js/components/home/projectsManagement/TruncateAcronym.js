import React from 'react';
import truncateItem from 'truncate-utf8-bytes';

/**
 * Show given characters or truncate string and display with
 * tooltip (hint) which is entire string.
 * Could not use regular hint in wrapped textbox. See style.css for wraptip style
 * @param longText: name of book or language
 * @param abbrev  : abbreviation for book or language
 * @param len     : length of text to display
 * @param targetLanguageBookName : possible bookname translated into target language
 * @return HTML formatted tool tip
 */
function TruncateAcronym(longText, abbrev, len, targetLanguageBookName) {
  const bookName = targetLanguageBookName || longText;

  if (bookName.length + abbrev.length + 3 > len) {
    return (
      <div className='wraptip'> {truncateItem( '('.concat(abbrev, ') ', bookName), len + 3) + '...' }
        <span className='wraptip-text'>{'('.concat(abbrev, ') ', bookName)}</span>
      </div>
    );
  } else {
    return (
      <span> {'('.concat(abbrev, ') ', bookName)}</span>
    );
  }
}

export default TruncateAcronym;
