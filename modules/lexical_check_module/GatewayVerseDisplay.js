//GatewayVerseDisplay.js//

const XRegExp = require('xregexp');

const api = window.ModuleApi;
const React = api.React;
const ReactBootstrap = api.ReactBootstrap;

const Well = ReactBootstrap.Well;

class GatewayVerseDisplay extends React.Component {
  constructor() {
    super();
    this.state = { };
  }

  generateWordArray() {
    var wordRegex = this.props.wordObject.regex
    var currentVerse = this.props.verse,
      occurrence = 0,
      index = 0,
      saveVerse = currentVerse,
      matches = null;
    for (var wordRegex of this.props.wordObject.regex) {
      matches = currentVerse.match(wordRegex);
      index += matches ? matches.index : 0;
      occurrence += matches ? 1 : 0;
      if (occurrence == this.props.occurrence) {
        break;
      }
      while (occurrence < this.props.occurrence && matches) {
        index += matches[0].length;
        currentVerse = currentVerse.slice(index);
        matches = currentVerse.match(wordRegex);
        if (!matches) {
          // console.error('Unable to find the word: ' + this.props.wordObject.name);
          break;
        }
        else {
          occurrence++;
          index += matches.index;
        }
      }
    }

    if (index != -1) {
      /*
       * Split the verse on either side of the actual word. This assumes that the | character
       * will never be found in the Bible
       */
      //We need to get the actual word that was in the verse, the regex could contain several
      var actualWord = matches[0];

      var first, last;
      var newStr = replaceFrom(saveVerse, index, index + actualWord.length, '|');
      [first, last] = newStr.split('|');
      return [<span key={0}>{first}</span>,
        <span key={1} className={"text-primary"}>{actualWord}</span>,
        <span key={2}>{last}</span>];
    }
    else {
      console.error('Unable to display GatewayVerse');
    }
  }

  render() {
    return(
      <Well bsSize={'small'} style={{minHeight: '128px', marginBottom: '5px'}}>
        <div
          style={{
            textAlign: "center",
            overflowY: "scroll",
            minHeight: "50px",
            maxHeight: "100px"
          }}
        >
          {this.generateWordArray()}
        </div>
      </Well>
    )
  }
}

function replaceAt(str, index, character) {
  return str.substr(0, index) + character + str.substr(index+character.length);
}

function replaceFrom(str, indexStart, indexEnd, character) {

  return str.substr(0, indexStart) + character + str.substr(indexEnd);
}

module.exports = GatewayVerseDisplay;
