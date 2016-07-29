//TargetVerseDisplay.js//

const api = window.ModuleApi;
const React = api.React;
const ReactBootstrap = api.ReactBootstrap;

var natural = require('natural');
var XRegExp = require('xregexp');
var nonUnicodeLetter = XRegExp('\\PL');

//Wordlength tokenizer
const tokenizer = new natural.RegexpTokenizer({pattern: nonUnicodeLetter});

const Well = ReactBootstrap.Well;

/* Contains a word from the target language, defines a lot of listeners for clicks */
const TargetWord = React.createClass({
// highlighted: false,
  getInitialState: function() {
    return {
      highlighted: false,
      wordObj: { // this is required to pass into our callbacks
        'word': this.props.word,
        'key': this.props.keyId
      }
    };
  },

  userClick: function() {
  // toggles the internal state and changes the actual style of the element
    this.toggleHighlight();
  },

  removeHighlight: function() {
    if (this.state.highlighted) {
      this.setState({
        highlighted: false
      });
    }
  },

  componentWillReceiveProps: function(nextProps) {
    this.setState({
      wordObj: {
        'word': nextProps.word,
        'key': this.props.keyId
      }
    });
  },

  toggleHighlight: function() {
    if (!this.state.highlighted) {
      this.props.selectCallback(this.state.wordObj);
    }
    else {
      this.props.removeCallback(this.state.wordObj);
    }
    this.setState({highlighted: !this.state.highlighted}); // this sets React to re-render the component
  },

  render: function() {

    return (
      <span
        className={this.state.highlighted ? 'text-primary' : 'text-muted'}
        onClick={this.userClick}
        style={this.props.style}
      >
        {this.props.word}
      </span>
      );
    }
});

const TargetLanguageSelectBox = React.createClass({
  selectedWords: [], // holds wordObjects, each have {'word', 'key'} attributes

  cursorPointerStyle: {
    cursor: 'pointer'
  },

  shouldComponentUpdate: function(nextProps, nextState) {
    for (key in this.refs)
      this.refs[key].removeHighlight();
    this.selectedWords = [];
    return true;
  },

  generateWordArray: function() {
    var words = tokenizer.tokenize(this.props.verse),
      wordArray = [],
      index = 0,
      tokenKey = 0,
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
      wordArray.push(
        <TargetWord 
          word={word} 
          key={wordKey++} 
          keyId={tokenKey++} 
          style={this.cursorPointerStyle}
          selectCallback={this.addSelectedWord}
          removeCallback={this.removeFromSelectedWords}
          ref={tokenKey.toString()}
        />
      );
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
          overflowY: "scroll"
        }}
      >
        <span>{words}</span>
      </Well>
    );
  },

  addSelectedWord: function(wordObj) {
    // check to see if we already have this word
    // an inefficient search, but shouldn't have >10 words to search through
    var idFound = false;
    for (var i = 0; i < this.selectedWords.length; i++) {
      if (this.selectedWords[i].key == wordObj.key) {
        idFound = true;
      }
    }
    if (!idFound) {
      this.selectedWords.push(wordObj);
      this.sortSelectedWords();
    }

    /* This is used for if you want to enable disabled buttons after the user has 
     * selected at least one word
     */
    // if (this.selectedWords.length > 0) {
    //   this.props.buttonEnableCallback();
    // }
  },

  removeFromSelectedWords: function(wordObj) {
  // get the word's index
    var index = -1;
    for (var i = 0; i < this.selectedWords.length; i++) {
      if (this.selectedWords[i].key == wordObj.key) {
        index = i;
      }
    }
    if (index != -1) {
      this.selectedWords.splice(index, 1);
    }

    //This is used for if you want to disable the buttons if no words are selected
    // if (this.selectedWords.length <= 0) {
    //   this.props.buttonDisableCallback();
    // }
  },

/* Sorts the selected words by their 'key' attribute */
  sortSelectedWords: function() {
    this.selectedWords.sort(function(first, next) {
      return first.key - next.key;
    });
  },

  /**
   * @description - This returns the currently selected words, but formats in 
   * an array with adjacent words concatenated into one string
   */
  getWords: function() {
    var lastKey = -100;
    var returnArray = [];
    for (var wordObj of this.selectedWords){
      if (lastKey < wordObj.key - 1) {
        returnArray.push(wordObj.word);
        lastKey = wordObj.key
      }
      else if (lastKey == wordObj.key - 1) {
        var lastWord = returnArray.pop();
        lastWord += ' ' + wordObj.word;
        returnArray.push(lastWord);
        lastKey = wordObj.key
      }
    }
    return returnArray;
  }
});

module.exports = TargetLanguageSelectBox;