var Lexicon = require('./Lexicon.json');

function LexiconLookup(strong, concise){
  if (Lexicon[strong] && concise) {
    return Lexicon[strong].brief;
  } else if (Lexicon[strong] && !concise) {
    return Lexicon[strong].long;
  } else {
    return 'No definition found.'
  }
}

module.exports = LexiconLookup;
