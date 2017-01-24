/**
 *@author: Ian Hoegen
 *@description: The file handles the submit box for a git url to be cloned.
 ******************************************************************************/
const React = require('react');

const FormGroup = require('react-bootstrap/lib/FormGroup.js');
const FormControl = require('react-bootstrap/lib/FormControl.js');
const Button = require('react-bootstrap/lib/Button.js');
const Glyphicon = require('react-bootstrap/lib/Glyphicon.js');
const InputGroup = require('react-bootstrap/lib/InputGroup.js');

class OnlineInput extends React.Component {
  constructor() {
    super();
  }

  render() {
    var main = {
      width: '60%',
      color: '#ffffff',
    };
    return (
        <FormGroup controlId="onlineInput">
          <InputGroup style={main}>
            <FormControl  type="text" style={{width: '78%', borderRadius: '4px'}}
            placeholder="Enter URL"
            onChange={this.props.onChange} />
            <Button bsStyle="primary" onClick={this.props.load}>
            <Glyphicon glyph="folder-open"/>
            <span style={{marginLeft: '15px', fontWeight: 'bold'}}>Import</span>
          </Button>
          </InputGroup>
        </FormGroup>
    );
  }
}

module.exports = OnlineInput;
