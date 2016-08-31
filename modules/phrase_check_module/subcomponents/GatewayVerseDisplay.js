///GatewayVerseDisplay.js//

const api = window.ModuleApi;
const React = api.React;
const ReactBootstrap = api.ReactBootstrap;

var natural = require('natural');
var XRegExp = require('xregexp');
var nonUnicodeLetter = XRegExp('\\PL');

//Wordlength tokenizer
const tokenizer = new natural.RegexpTokenizer({pattern: nonUnicodeLetter});
const Well = ReactBootstrap.Well;

const GatewayVerseDisplay = React.createClass({
  generateWordArray: function() {
    var words = tokenizer.tokenize(this.props.verse),
      wordArray = [],
      index = 0,
      tokenKey = 1,
      wordKey = 0;
    for (var word of words) {
      var wordIndex = this.props.verse.indexOf(word, index);
      if (wordIndex > index) {
        wordArray.push(
          <span
            key={wordKey++}
            style={this.cursorPointerStyle}
          >
            {this.props.verse.substring(index, wordIndex)}
          </span>
        );
      }
      wordArray.push(word);
      tokenKey++;
      index = wordIndex + word.length;
    }
    return wordArray;
  },

  render: function() {
    var words = this.generateWordArray();
    return (
      <Well
        bsSize={'small'}
        style={{
          overflowY: "scroll",
          minHeight: "128px",
          maxHeight: "128px",
          marginBottom: "2.5px",
        }}
      >
        <h4 style={{marginTop: "0px"}}>{this.props.currentVerse}</h4>
        <span>{words}</span>
      </Well>
    );
  },
});

module.exports = GatewayVerseDisplay;
