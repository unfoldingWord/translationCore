/**
  * @description: This file builds the verses
  * @author: Ian Hoegen
******************************************************************************/

const api = window.ModuleApi;
const React = api.React;
const lookup = require("./LexiconLookup");

class Verse extends React.Component {
  constructor() {
    super();
    this.state = {
      highlighted: false
    }
  }

  setHighlighted(highlighted) {
    this.setState({
      highlighted: highlighted
    });
  }

  render() {
    return (
      <p>
        <strong className={this.state.highlighted ? 'text-primary' : ''}>
          {this.props.verseNumber + " "}
        </strong>
        <span className={this.state.highlighted ? 'text-primary' : ''}>
          {this.props.greek ? displayGreek(this.props.verseText) : this.props.verseText}
        </span>
      </p>
    );
  }
}


function displayGreek(text = []) {
  let i = 0;
  return text.map((word) => {
    var PopoverTitle = <span>
                         {word.word + " | "}
                         <a href={'http://studybible.info/mac/' + word.speech} target="_blank">
                           <b>
                            {word.speech}
                           </b>
                         </a>
                       </span>
    return (<span
              key={i++}
              strong={word.strong}
              style={{cursor: 'pointer'}}
              speech={word.speech}
              onClick={function(e){
                var x = e.target.getBoundingClientRect().left;
                var y = e.target.getBoundingClientRect().bottom;
                api.Popover(true, PopoverTitle, word.brief, x, y);
              }}>
                {word.word + " "}
              </span>
            );
  });
}

module.exports = Verse;
