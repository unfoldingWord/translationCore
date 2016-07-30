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
    // var wordRegex = this.props.regex;
    // match = currentVerse.match(wordRegex);
    // index += match ? match.index : 0;
    // var occurrence = match ? 1 : 0;
    // while (occurrence < this.props.occurrence && match) {
    //   index += match[0].length;
    //   currentVerse = currentVerse.slice(index);
    //   match = currentVerse.match(wordRegex);
    //   if (!match) {
    //     // console.error('Unable to find the word: ' + this.props.wordObject.name);
    //     break;
    //   }
    //   else {
    //     occurrence++;
    //     index += match.index;
    //   }
    // }

    /* 
     * Split the verse on either side of the actual word. This assumes that the | character
     * will never be found in the Bible
     */
    //We need to get the actual word that was in the verse, the regex could contain several

    var first, last;
    var newStr = replaceFrom(this.props.verse, this.props.check.index, 
      this.props.check.index + this.props.check.word.length, '|');
    [first, last] = newStr.split('|');
    return [<span key={0}>{first}</span>,
      <span key={1} className={"text-primary"}>{this.props.check.word}</span>,
      <span key={2}>{last}</span>];
  }

  render() {
    return(
      <Well bsSize={'small'}>
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