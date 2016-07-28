const api = window.ModuleApi;

const React = api.React;
const ReactBootstrap = api.ReactBootstrap;

const Well = ReactBootstrap.Well;

const CURRENT_WORD= "CurrentWord: ";

class WordComponent extends React.Component {
  constructor() {
    super();
    this.state = {

    }
  }

  render() {
    return (
      <Well bsSize={'small'} style={{height: "60px", textAlign: "center"}}><span>{CURRENT_WORD}</span><div className={"text-primary"}>
        {this.props.word}
      </div></Well>);
  }
}

module.exports = WordComponent;
