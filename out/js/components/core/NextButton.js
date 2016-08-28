const React = require('react');
const Button = require('react-bootstrap/lib/Button.js');
const Glyphicon = require('react-bootstrap/lib/Glyphicon.js');

const api = window.ModuleApi;

const SaveAndContinue = 'Save and Continue ';
class NextButton extends React.Component {
  constructor() {
    super();
    this.buttonClicked = this.buttonClicked.bind(this);
  }

  buttonClicked() {
    api.emitEvent('goToNext');
  }

  render() {
    return React.createElement(
      Button,
      { bsStyle: 'primary', onClick: this.buttonClicked, style: { marginBottom: "10px", float: 'right' } },
      SaveAndContinue,
      ' ',
      React.createElement(Glyphicon, { glyph: 'arrow-right' })
    );
  }
}

module.exports = NextButton;