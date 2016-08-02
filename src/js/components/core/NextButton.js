const React = require('react');
const Button = require('react-bootstrap/lib/Button.js');
const Glyphicon  = require('react-bootstrap/lib/Glyphicon.js');

const api = window.ModuleApi;
const git = require('./GitApi.js');

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
    return (
        <Button bsStyle='primary' onClick={this.buttonClicked} style={{marginBottom: "10px"}}>
          {SaveAndContinue}
          &nbsp;<Glyphicon glyph="arrow-right" />
        </Button>
    );
  }
}

module.exports = NextButton;
