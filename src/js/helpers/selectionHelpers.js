/**
 * 
 * @param {string} - Entire string to search within 'Blessed be the name of the Lord'
 * @param {string} subString - substring to search for inside of entire string i.e. 'bless, blessed, blessing'
 */
export const getQuoteOccurrencesInVerse = (string, subString) => {
  var n = 0;
  if (subString.length <= 0) return 0;
  if (subString.split(',').length > 1) {
    let stringArray = subString.split(',');
    stringArray.forEach((element) => {
      n += getQuoteOccurrencesInVerse(string, element.trim());
    })
    return n;
  } else {
    if (subString.includes('...')) subString = subString.replace('...', '.*');
    const regex = new RegExp(`\\W+${subString}\\W+`,'g');
    let matchedSubstring;
    while ((matchedSubstring = regex.exec(string)) !== null) {
      // This is necessary to avoid infinite loops with zero-width matchedSubstring
      if (matchedSubstring.index === regex.lastIndex) {
        regex.lastIndex++;
      }
      n++;
    }
    return n;
  }
}

 /**
  * @description Function that count occurrences of a substring in a string
  * @param {String} string - The string to search in
  * @param {String} subString - The sub string to search for
  * @returns {Integer} - the count of the occurrences
  * @see http://stackoverflow.com/questions/4009756/how-to-count-string-occurrence-in-string/7924240#7924240
  * modified to fit our use cases, return zero for '' substring, and no use case for overlapping.
  */
export const occurrences = (string, subString) => {
  if (subString.length <= 0) return 0
  var n = 0, pos = 0, step = subString.length
  while (true) {
    pos = string.indexOf(subString, pos)
    if (pos === -1) break
    ++n
    pos += step
  }
  return n
}

/**
 * @description This checks to see if the string still has the same number of occurrences.
 * It should remove the selections that the occurrences do not match
 * @param {string} string - the text selections are found in
 * @param {array}  selections - array of selection objects [Obj,...]
 * @returns {array} - array of selection objects
 */
export const checkSelectionOccurrences = (string, selections) => {
  selections = selections.filter(selection => {
    let count = occurrences(string, selection.text)
    return count === selection.occurrences
  })
  return selections
}
