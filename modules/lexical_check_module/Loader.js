//Loaders.js//

/**
 * This file determines how some data in the check store will be loaded
 * into memory in case JSON.parse doesn't do it correctly
 */

const XRegExp = require('xregexp');

module.exports = function(data) {
  for (var wordObject of data.wordList) {
    if ('regex' in wordObject) {
      var currentRegexObject = wordObject.regex.xregexp;
      wordObject.regex = new XRegExp(currentRegexObject.source, currentRegexObject.flags);
    }
  }
}
    