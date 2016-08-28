const React = require('react');
const Button = require('react-bootstrap/lib/Button.js');
const Glyphicon = require('react-bootstrap/lib/Glyphicon.js');

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
    return React.createElement(
      Button,
      { bsStyle: 'primary', onClick: this.buttonClicked, style: { marginBottom: "10px" } },
      React.createElement(Glyphicon, { glyph: 'arrow-left' }),
      ' ',
      text
    );
  }
}

module.exports = NextButton;