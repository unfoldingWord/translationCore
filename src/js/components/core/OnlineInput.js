/**
 *@author: Ian Hoegen
 *@description: The file handles the submit box for a git url to be cloned.
 ******************************************************************************/
const React = require('react');

const FormGroup = require('react-bootstrap/lib/FormGroup.js');
const FormControl = require('react-bootstrap/lib/FormControl.js');
const Button = require('react-bootstrap/lib/Button.js');

class OnlineInput extends React.Component {
  constructor() {
    super();
  }

  render() {
    var main = {
      width: '100%',
      color: '#ffffff',
      height: '200px',
      fontSize: '25px'
    };
    return (
        <FormGroup controlId="onlineInput" style={main}>
          <FormControl type="text"
          placeholder="Enter URL"
          onChange={this.props.onChange} />
        </FormGroup>
    );
  }
}

module.exports = OnlineInput;
