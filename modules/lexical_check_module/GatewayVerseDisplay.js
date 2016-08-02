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
    /*
     * Split the verse on either side of the actual word. This assumes that the | character
     * will never be found in the Bible
     */
    var first, last;
    var newStr = replaceFrom(this.props.verse, this.props.check.index,
      this.props.check.index + this.props.check.word.length, '|');
    [first, last] = newStr.split('|');
    /* this return every up to the word, then the word itself with highlighting,
     * the rest of the verse until the end
     */
    return [<span key={0}>{first}</span>,
      <span key={1} className={"text-primary"}>{this.props.check.word}</span>,
      <span key={2}>{last}</span>];
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
