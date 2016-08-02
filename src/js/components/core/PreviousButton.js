const React = require('react');
const Button = require('react-bootstrap/lib/Button.js');
const Glyphicon  = require('react-bootstrap/lib/Glyphicon.js');

const api = window.ModuleApi;

const text = ' Previous';
class NextButton extends React.Component {
  constructor() {
    super();
    this.buttonClicked = this.buttonClicked.bind(this);
  }

  buttonClicked() {
    api.emitEvent('goToPrevious');
  }

  render() {
    return (
      <Button bsStyle='primary' onClick={this.buttonClicked} style={{marginBottom: "10px"}}>
        <Glyphicon glyph="arrow-left" />&nbsp;
        {text}
      </Button>
    );
  }
}

module.exports = NextButton;
