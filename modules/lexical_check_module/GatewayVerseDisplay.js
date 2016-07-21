//GatewayVerseDisplay.js//

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
    var wordArray = [];
    var words = this.props.verse.split(' ');
    var wordKey = 0,
      currentWordIndex = 0;
    for (var word of words) {
      var foundWordAlias = false;
      for (var aliases of this.props.wordObject.aliases) {
        if (aliases.toLowerCase() == word.toLowerCase()) {
          foundWordAlias = true;
          break;
        }
      }
      if (foundWordAlias) {
        wordArray.push(
          <span 
            className="text-primary"
            key={wordKey++}
          >
            {word}
          </span>
        );
      }
      else {
        wordArray.push(<span key={wordKey++}>{word}</span>);
      }
      currentWordIndex++;
      if (currentWordIndex < words.length) {
        wordArray.push(<span key={wordKey++}>{' '}</span>);
      }
    }
    return wordArray;
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

module.exports = GatewayVerseDisplay;