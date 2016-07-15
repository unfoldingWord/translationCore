const React = require('react');
const Button = require('react-bootstrap/lib/Button.js');
const Glyphicon  = require('react-bootstrap/lib/Glyphicon.js');

const CheckActions = require('../../actions/CheckActions');

const SaveAndContinue = 'Save and Continue';
class NextButton extends React.Component {
  constructor() {
    super();
    this.buttonClicked = this.buttonClicked.bind(this);
  }

  buttonClicked() {
    CheckActions.nextCheck();
  }

  render() {
    return (
        <Button className='btn' onClick={this.buttonClicked}>
          {SaveAndContinue}
          <Glyphicon glyph="arrow-right" />
        </Button>
    );
  }
}

module.exports = NextButton;
