import XRegExp from 'xregexp';
/**
 * @Description - tokenize a string into an array of words
 * @Param {String} string - string to be tokenized
 * @Return {Array} - array of tokenized words/strings
 * TODO: move this to an external npm package to consume with other helpers
 */
export const tokenize = (string) => {
  string = (!string) ? '' : string; // if string is undefined, make it an empty string
  if (typeof string !== 'string')
    throw 'tokenizer.tokenize() string is not String: ' + string;
  let tokens = [];
  const regexp = XRegExp('[^\\pL\\pM]+?', 'g');
  let _tokens = string.split(regexp);
  _tokens.forEach(function(token) {
    token.trim();
    if (token.length > 0) tokens.push(token);
  });
  return tokens;
};
