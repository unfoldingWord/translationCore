import React from 'react';
import truncateItem from 'truncate-utf8-bytes';

/**
 * Show given characters or truncate string and display with
 * tooltip (hint) which is entire string.
 * Could not use regular hint in wrapped textbox. See style.css for wraptip style
 * @param longText: name of book or language
 * @param abbrev  : abbreviation for book or language
 * @param len     : length of text to display
 * @return HTML formatted tool tip
 */
function TruncateAcronym(longText, abbrev, len) {
  if(longText.length + abbrev.length + 3 > len) {
   return (
    <div className='wraptip'> {truncateItem( "(".concat(abbrev, ") ", longText), len + 3) + "..." }
      <span className='wraptip-text'>{"(".concat(abbrev, ") ", longText)}</span>
    </div>
   );
  } else {
    return(
      <span> {"(".concat(abbrev, ") ", longText)}</span>
    );
  }
}

export default TruncateAcronym;
