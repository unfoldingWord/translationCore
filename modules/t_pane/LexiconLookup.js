var Lexicon = require('./Lexicon.js');

function LexiconLookup(strong){
  if (Lexicon.hasOwnProperty(strong)) {
    return Lexicon[strong];
  } else {
    return undefined;
  }
}

module.exports = LexiconLookup;
