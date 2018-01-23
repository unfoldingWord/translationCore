import XRegExp from 'xregexp';
// constants
export const word = XRegExp('[\\pL\\pM]+', '');
export const punctuation = XRegExp('(^\\p{P}|[<>]{2})', '');
export const whitespace = /\s+/;
const tokenizerOptions = {word, whitespace, punctuation};
/**
 * @Description - tokenize a string into an array of words
 * @Param {String} string - string to be tokenized
 * @Return {Array} - array of tokenized words/strings
 * TODO: move this to an external npm package to consume with other helpers
 */
export const tokenize = (string) => {
  const _tokens = classifyTokens(string, tokenizerOptions);
  const tokens = _tokens.filter(token => token.type === 'word')
  .map(token => token.token);
  return tokens;
};
/**
 * @Description - tokenize a string into an array of words
 * @Param {String} string - string to be tokenized
 * @Return {Array} - array of tokenized words/strings
 * TODO: move this to an external npm package to consume with other helpers
 */
export const tokenizeWithPunctuation = (string) => {
  const _tokens = classifyTokens(string, tokenizerOptions);
  const tokens = _tokens.filter(token => token.type === 'word' || token.type === 'punctuation')
  .map(token => token.token);
  return tokens;
};
/**
 * gets the occurrence of a subString in a string by using the subString index in the string.
 * @param {String} string
 * @param {Number} currentWordIndex
 * @param {String} subString
 * TODO: Replace with the tokenizer version of this to prevent puctuation issues
 * Cannot replace with tokenizer until tokenizer handles all greek use cases that broke tokenizer
 */
export const getOccurrenceInString = (string, currentWordIndex, subString) => {
  let arrayOfStrings = string.split(' ');
  let occurrence = 1;
  let slicedStrings = arrayOfStrings.slice(0, currentWordIndex);

  slicedStrings.forEach((slicedString) => {
    if (slicedStrings.includes(subString)) {
      slicedString === subString ? occurrence += 1 : null;
    } else {
      occurrence = 1;
    }
  });
  return occurrence;
};
/**
 * @description Function that count occurrences of a substring in a string
 * @param {String} string - The string to search in
 * @param {String} subString - The sub string to search for
 * @returns {Integer} - the count of the occurrences
 * @see http://stackoverflow.com/questions/4009756/how-to-count-string-occurrence-in-string/7924240#7924240
 * modified to fit our use cases, return zero for '' substring, and no use case for overlapping.
 */
export const occurrencesInString = (string, subString) => {
  if (subString.length <= 0) return 0;
  let occurrences = 0, position = 0, step = subString.length;
  while (position < string.length) {
    position = string.indexOf(subString, position);
    if (position === -1) break;
    ++occurrences;
    position += step;
  }
  return occurrences;
};

/**
 * @Description - Tiny tokenizer - https://gist.github.com/borgar/451393
 * @Param {String} string - string to be tokenized
 * @Param {Object} parsers - { word:/\w+/, whitespace:/\s+/, punctuation:/[^\w\s]/ }
 * @Param {String} deftok - type to label tokens that are not classified with the above parsers
 * @Return {Array} - array of objects => [{ token:"this", type:"word" },{ token:" ", type:"whitespace" }, Object { token:"is", type:"word" }, ... ]
**/
export const classifyTokens = (string, parsers, deftok) => {
  string = (!string) ? '' : string; // if string is undefined, make it an empty string
  if (typeof string !== 'string')
    throw 'tokenizer.tokenize() string is not String: ' + string;
  var m, r, l, t, tokens = [];
  while (string) {
   t = null;
   m = string.length;
   for ( var key in parsers ) {
     r = parsers[ key ].exec( string );
     // try to choose the best match if there are several
     // where "best" is the closest to the current starting point
     if ( r && ( r.index < m ) ) {
       t = {
         token: r[ 0 ],
         type: key,
         matches: r.slice( 1 )
       };
       m = r.index;
     }
   }
   if ( m ) {
     // there is text between last token and currently
     // matched token - push that out as default or "unknown"
     tokens.push({
       token : string.substr( 0, m ),
       type  : deftok || 'unknown'
     });
   }
   if ( t ) {
     // push current token onto sequence
     tokens.push( t );
   }
   string = string.substr( m + (t ? t.token.length : 0) );
  }
  return tokens;
};
